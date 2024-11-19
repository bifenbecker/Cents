const Pipeline = require('../pipeline');

// uows
const machineListUOW = require('../../uow/machines/getAvailableMachineListUOW');

/**
 *
 *
 * @param {*} payload
 * @return {*} available machine List for store
 */
async function getAvailableMachineList(payload) {
    try {
        const machineList = new Pipeline([machineListUOW]);
        const output = await machineList.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getAvailableMachineList;
