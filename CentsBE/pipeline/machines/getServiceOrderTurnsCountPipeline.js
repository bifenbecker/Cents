const Pipeline = require('../pipeline');

// uows
const getServiceOrderTurnsCountUOW = require('../../uow/machines/turnList/getServiceOrderTurnsCountUOW');

/**
 *
 *
 * @param {*} payload
 * @return {*} turns Count
 */
async function getServiceOrderTurnsCount(payload) {
    try {
        const turnsCount = new Pipeline([getServiceOrderTurnsCountUOW]);
        const output = await turnsCount.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getServiceOrderTurnsCount;
