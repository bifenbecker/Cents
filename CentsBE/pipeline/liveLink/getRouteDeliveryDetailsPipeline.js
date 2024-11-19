const Pipeline = require('../pipeline');

// Uows
const routeDeliveryUOW = require('../../uow/liveLink/serviceOrders/routeDeliveryUOW');

async function getRouteDeliveryPipeline(payload) {
    try {
        const routeDeliveryPipeline = new Pipeline([routeDeliveryUOW]);
        const output = await routeDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getRouteDeliveryPipeline;
