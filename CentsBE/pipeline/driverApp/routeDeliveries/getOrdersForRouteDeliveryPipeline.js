const Pipeline = require('../../pipeline');

// Uows
const getOrdersForRouteDeliveryUOW = require('../../../uow/driverApp/getOrdersForRouteDeliveryUOW');
const getStoreFromRouteDeliveryUOW = require('../../../uow/driverApp/getStoreFromRouteDeliveryUOW');

async function getOrdersForRouteDeliveryPipeline(payload) {
    try {
        const pipeline = new Pipeline([getStoreFromRouteDeliveryUOW, getOrdersForRouteDeliveryUOW]);

        const output = await pipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = getOrdersForRouteDeliveryPipeline;
