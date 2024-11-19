const Pipeline = require('../pipeline');

// Uows
const getStoresList = require('../../uow/driverApp/storesListUOW');

/**
 * Get the stores list for the driver.
 *
 * The pipeline contains the following units of work:
 *
 * 1) get stores list.
 *
 * @param {Object} payload
 */
async function getStoresListPipeline(payload) {
    try {
        const storesListPipeline = new Pipeline([getStoresList]);
        const output = await storesListPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getStoresListPipeline;
