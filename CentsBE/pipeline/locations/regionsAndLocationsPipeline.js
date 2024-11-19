const Pipeline = require('../pipeline');

// Uows
const regionsAndLocationUOW = require('../../uow/locations/regionsAndDistrictsUOW');

/**
 * Get the regions and  locations for the BO.
 *
 * The pipeline contains the following units of work:
 *
 * 1) get regions and location UOW
 *
 * @param {Object} payload
 */
async function regionsAndLocationsPipeline(payload) {
    try {
        const regionsAndLocations = new Pipeline([regionsAndLocationUOW]);
        const output = await regionsAndLocations.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = regionsAndLocationsPipeline;
