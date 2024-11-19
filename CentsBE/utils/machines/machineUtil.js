const { deviceStatuses } = require('../../constants/constants');

function getMachineNamePrefix(machineModel) {
    const { machineType } = machineModel;
    return machineType.name.split('')[0].toUpperCase();
}

function getMachineType(machineModel) {
    const { machineType } = machineModel;
    return machineType.name;
}

function getDevice(machine) {
    if (machine.pairing) {
        const activePairing = machine.pairing.find((pair) => !pair.deletedAt);
        if (activePairing) {
            return {
                id: activePairing.device.id,
                name: activePairing.device.name,
                isPaired: activePairing.device.isPaired,
                status: activePairing.device.status,
            };
        }
    }

    return {};
}

function getMachineModelDetails(machine) {
    const { model } = machine;
    return {
        capacity: model.capacity,
        modelName: model.modelName,
        manufacturer: model.manufacturer,
        type: getMachineType(model),
    };
}

function getMachinePricePerTurn(machine) {
    const { machinePricings } = machine;
    return machinePricings.length ? machinePricings[0].price : null;
}

function getMachineTurnCode(machineTurnsCount) {
    return 1000 + Number(machineTurnsCount) + 1;
}

function isMachineAvailable(device, activeTurn) {
    return Boolean(device.status === deviceStatuses.ONLINE && !activeTurn.id);
}

function getLaundromatBusiness(machine) {
    const { store } = machine;
    const laundromatBusiness = store?.laundromatBusiness;
    const business = {
        id: laundromatBusiness?.id,
    };

    return business;
}

const mapMachineData = (machine) => ({
    id: machine.id,
    store: {
        id: machine.store.id,
        address: machine.store.address,
        name: machine.store.name,
    },
    name: machine.name,
    activeTurns: {},
    device: {},
    serialNumber: machine.serialNumber || null,
    prefix: `${machine.model.machineType.name.charAt(0)}`,
    model: {
        capacity: machine.model.capacity,
        modelName: machine.model.modelName,
        manufacturer: machine.model.manufacturer,
        type: machine.model.machineType.name,
    },
    avgTurnsPerDay: machine.machineTurnsStats ? machine.machineTurnsStats.avgTurnsPerDay : null,
    avgSelfServeRevenuePerDay: machine.machineTurnsStats
        ? machine.machineTurnsStats.avgSelfServeRevenuePerDay
        : null,
    pricePerTurnInCents:
        machine.machinePricings && machine.machinePricings.length
            ? machine.machinePricings[0].price
            : 0,
    turnTimeInMinutes: machine.turnTimeInMinutes,
});

module.exports = {
    getMachineNamePrefix,
    getMachineType,
    getDevice,
    getMachinePricePerTurn,
    getMachineModelDetails,
    getMachineTurnCode,
    isMachineAvailable,
    getLaundromatBusiness,
    mapMachineData,
};
