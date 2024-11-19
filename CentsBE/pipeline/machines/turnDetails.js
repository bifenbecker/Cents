const Pipeline = require('../pipeline');

// uows
const turnDetailsUOW = require('../../uow/machines/turnDetailsUOW');
/**
 *
 *
 * @param {*} payload
 * @return {*} turn details
 */
async function getTurnDetails(payload) {
    try {
        const turnDetails = new Pipeline([turnDetailsUOW]);
        const output = await turnDetails.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getTurnDetails;
