const Pipeline = require('../pipeline');

// Uows
const timing = require('../../uow/driverApp/getTimingsUOW');
const stops = require('../../uow/driverApp/stopsUOW');
const storeStops = require('../../uow/driverApp/storeStopsUOW');

/**
 * Get the stops list for the driver.
 *
 * The pipeline contains the following units of work:
 *
 * 1) timing
 * 2) stops .
 * 3) storeStops.
 *
 * @param {Object} payload
 */
async function getStopsPipeline(payload) {
    try {
        const stopsPipeline = new Pipeline([timing, stops, storeStops]);
        const output = await stopsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getStopsPipeline;
