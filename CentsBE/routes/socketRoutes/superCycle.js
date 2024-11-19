const io = require('../../socket/server/namespaces').namespaces;

const HeartBeat = require('../../mongooseModels/heartbeats');
const SuperCycle = require('../../mongooseModels/superCycle');
const Pairing = require('../../models/pairing');
const { MACHINE_STATES } = require('../../lib/constants');
const { userResponseCreator } = require('../../utils/socketEventEmitters');
const getStore = require('../../utils/getMachineStore');

// need clarity about superCycle events. Whom to emit? storeLevel or machineLevel.

function superCycleObjectCreator(record, machineDetails) {
    if (record.order) {
        return {
            machineId: machineDetails.machineId,
            deviceId: record.deviceId,
            cyclePrice: record.cyclePrice ? record.cyclePrice : null,
            orderId: record.order.id ? record.order.id : null,
            customerId: record.order.customerId ? record.order.customerId : null,
            employeeId: record.order.employeeId ? record.order.employeeId : null,
            notes: record.order.notes ? record.order.notes : null,
            washReason: record.order.washReason ? record.order.washReason : null,
            cycleSettings: record.cycleSettings ? record.cycleSettings : null,
            status: MACHINE_STATES[record.status],
        };
    }
    return {
        machineId: machineDetails.machineId,
        deviceId: record.deviceId,
        status: MACHINE_STATES[record.status],
    };
}

async function addRecord(machineId, cycle) {
    try {
        const currentMachine = await HeartBeat.findOne({ machineId });
        if (currentMachine) {
            const { heartBeat } = currentMachine;
            const lastHeartBeat = heartBeat[heartBeat.length - 1];
            const { status } = cycle;
            const newStatus = MACHINE_STATES[status];
            if (newStatus === lastHeartBeat.status) {
                return;
            }
        }
        const machineDetails = await Pairing.query()
            .where({
                machineId,
                isDeleted: false,
            })
            .first();
        await SuperCycle.create(superCycleObjectCreator(cycle, machineDetails));
        const updatedPairingRecord = await Pairing.query()
            .patch({
                runningStatus: MACHINE_STATES[cycle.status],
            })
            .findOne({
                machineId,
                isDeleted: false,
            })
            .returning('*');
        if (
            updatedPairingRecord.status !== 'STARTED' ||
            updatedPairingRecord.status !== 'FINISHED'
        ) {
            const storeId = await getStore(machineId);
            io.ui
                .to(storeId)
                .emit(
                    'MACHINE_RUNNING_STATUS_UPDATED',
                    userResponseCreator(
                        machineId,
                        updatedPairingRecord.deviceId,
                        updatedPairingRecord.runningStatus,
                    ),
                );
        }
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = addRecord;
