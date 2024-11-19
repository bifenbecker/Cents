const Device = require('../../../models/device');
const Machine = require('../../../models/machine');
const Turn = require('../../../models/turns');

class DeviceUtils {
    static async findDevice(name, transaction) {
        const device = await Device.query(transaction)
            .whereRaw('lower(name) = ?', [name.toLowerCase()])
            .first();
        return device;
    }

    static async updateDevice(id, payload, transaction) {
        const device = await Device.query(transaction).patch(payload).findById(id).returning('*');
        return device;
    }

    static async getDeviceAndMachineDetails(device, transaction) {
        const machine =
            (await Machine.query(transaction)
                .select(
                    'machines.id as machineId',
                    'machineTurnsStats.avgTurnsPerDay',
                    'machineTypes.name as machineType',
                    'machineTurnsStats.avgSelfServeRevenuePerDay',
                )
                .innerJoin('pairing', (context) => {
                    context
                        .on('machines.id', '=', 'pairing.machineId')
                        .andOnNull('pairing.deletedAt');
                })
                .innerJoin('machineModels', 'machineModels.id', 'machines.modelId')
                .innerJoin('machineTypes', 'machineTypes.id', 'machineModels.typeId')
                .leftJoin('machineTurnsStats', 'machineTurnsStats.machineId', 'machines.id')
                .where('pairing.deviceId', device.id)
                .first()) || {};
        return {
            deviceName: device.name,
            deviceId: device.id,
            machineId: machine.machineId || null,
            status: device.status,
            machineType: machine.machineType,
            avgTurnsPerDay: machine.avgTurnsPerDay || 0,
            avgRevenuePerDayInCents: machine.avgSelfServeRevenuePerDay || 0,
            error: device.error,
        };
    }

    static async getStore(deviceId, transaction) {
        const store =
            (await Device.query(transaction)
                .select('storeId')
                .join('batches', 'batches.id', 'devices.batchId')
                .where('devices.id', deviceId)
                .first()) || {};
        return store.storeId;
    }

    static async activeTurn({ machineId, transaction, deviceId }) {
        const turn =
            (await Turn.query(transaction)
                .select('id', 'serviceType')
                .findOne({
                    machineId,
                    deviceId,
                    completedAt: null,
                })
                .skipUndefined()) || {};
        return turn;
    }

    static async getInUseResponse({ device, transaction, turn }) {
        const deviceDetails = await this.getDeviceAndMachineDetails(device, transaction);
        const { machineId } = deviceDetails;
        // const activeTurn = machineId ? await this.activeTurn({ machineId, transaction }) : {};
        let activeTurn = turn;
        if (machineId && turn.id) {
            activeTurn = await this.activeTurn({ machineId, transaction });
        }
        return {
            ...deviceDetails,
            activeTurn,
        };
    }
}

module.exports = DeviceUtils;
