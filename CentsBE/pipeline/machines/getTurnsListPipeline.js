const Pipeline = require('../pipeline');

// uows
const turnListUOW = require('../../uow/machines/getTurnListUOW');
const validateMachineUOW = require('../../uow/machines/validateMachineUOW');

/**
 *
 *
 * @param {*} payload
 * @return {*} turn List
 */
async function getTurnsListPipeline(payload) {
    try {
        const turnList = new Pipeline([validateMachineUOW, turnListUOW]);
        const output = await turnList.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getTurnsListPipeline;
