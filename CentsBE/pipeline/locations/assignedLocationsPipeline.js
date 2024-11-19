const Pipeline = require('../pipeline');

// Uows
const assignedLocationsUOW = require('../../uow/locations/assignedLocationsUOW');

/**
 * Get the assigned locations for the BO.
 *
 * The pipeline contains the following units of work:
 *
 * 1) get assigned Locations UOW
 *
 * @param {Object} payload
 */
async function getAssignedLocationsPipeline(payload) {
    try {
        const assignedLocations = new Pipeline([assignedLocationsUOW]);
        const output = await assignedLocations.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getAssignedLocationsPipeline;
