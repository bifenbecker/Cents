const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const Machine = require('../../models/machine');

function mapStoreEvent(data) {
    const result = data.map((machineData) => {
        const { device } = machineData.pairing.find((ele) => ele.deletedAt === null);
        const { id, name, status } = device;
        return {
            id: machineData.id,
            device: {
                id,
                name,
                status,
            },
        };
    });
    return result;
}

async function insertMultipleMachinesPairing(payload) {
    try {
        let pairedMachines = 0;
        let newMachines = 0;
        if (!(payload.errors && payload.errors.length)) {
            const machinesInsertions = await payload.mappedMachinesData.map(async (machineData) => {
                pairedMachines += 1;
                if (!machineData.id) {
                    newMachines += 1;
                }
                return Machine.query(payload.transaction).upsertGraphAndFetch(machineData, {
                    noDelete: true,
                    relate: true,
                });
            });
            const result = await Promise.all(machinesInsertions);
            const storeEventMessage = await mapStoreEvent(result);
            return {
                storeEventMessage,
                pairedMachines,
                newMachines,
            };
        }
        return {
            errors: payload.errors,
        };
    } catch (err) {
        LoggerHandler('info', 'Error in insertMultiple Machines Pariing', payload);
        throw err;
    }
}

module.exports = insertMultipleMachinesPairing;
