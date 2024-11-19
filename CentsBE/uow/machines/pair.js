const Device = require('../../models/device');
const Machine = require('../../models/machine');
const MachinePrices = require('../../models/machinePricing');

async function buildMachineUpdateObj(machine, pricePerTurnInCents, turnTime, transaction) {
    const machineObject = {};
    machineObject.id = machine.id;
    machineObject.machinePricings = {};
    const price = await MachinePrices.query(transaction).findOne({
        machineId: machine.id,
        deletedAt: null,
    });
    if (price) {
        machineObject.machinePricings.id = price.id;
    }
    if (machine.type === 'DRYER' || machine.type === 'dryer') {
        machineObject.turnTimeInMinutes = turnTime;
        machineObject.machinePricings.price = 25;
    } else {
        machineObject.machinePricings.price = pricePerTurnInCents;
    }
    return machineObject;
}

async function pairMachine(payload) {
    try {
        const { deviceId, machineId, machine, pricePerTurnInCents, turnTime, user, transaction } =
            payload;

        const pairingObject = {
            deviceId,
            machineId,
            origin: user.source,
        };
        const deviceObject = {
            id: deviceId,
            isPaired: true,
        };
        const machineObject = await buildMachineUpdateObj(
            machine,
            pricePerTurnInCents,
            turnTime,
            transaction,
        );
        machineObject.origin = user.source;
        if (user.source === 'BUSINESS_MANAGER') {
            machineObject.userId = user.id;
        } else {
            machineObject.userId = user.userId;
        }
        pairingObject.pairedByUserId = machineObject.userId;
        machineObject.pairing = pairingObject;
        await Machine.query(transaction).upsertGraph(machineObject);
        await Device.query(transaction).patch(deviceObject).findById(deviceId);
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = pairMachine;
