const Pipeline = require('../pipeline');

// uows
const validateServiceOrderUOW = require('../../uow/machines/turnList/validateServiceOrderUOW');
const getServiceOrderTurnListUOW = require('../../uow/machines/turnList/getServiceOrderTurnListUOW');

/**
 *
 *
 * @param {*} payload
 * @return {*} turn List
 */
async function getServiceOrderTurnList(payload) {
    try {
        const turnsList = new Pipeline([validateServiceOrderUOW, getServiceOrderTurnListUOW]);
        const output = await turnsList.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getServiceOrderTurnList;
