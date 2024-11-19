const Pipeline = require('../pipeline');
// Uows
const completeStoreServiceOrderUow = require('../../uow/driverApp/completeStoreServiceOrder/completeStoreServiceOrderUow');
const {
    validateRouteDelivery,
    validateServiceOrder,
} = require('../../uow/driverApp/completeStoreServiceOrder/validateServiceOrderAndRouteDelivery');
const getStoreIdOfRoute = require('../../uow/driverApp/completeStoreServiceOrder/getStoreIdOfRoute');
/**
 *
 * @param {Object} payload
 * @returns {Object} output
 */

async function completeStoreServiceOrderPipeline(payload) {
    try {
        const storePipeline = new Pipeline([
            validateRouteDelivery,
            validateServiceOrder,
            getStoreIdOfRoute,
            completeStoreServiceOrderUow,
        ]);
        const output = await storePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = completeStoreServiceOrderPipeline;
