const Pipeline = require('../../pipeline');

// UOWs
const getRouteDeliveriesForRouteUOW = require('../../../uow/driverApp/route/getRouteDeliveriesForRouteUOW');
const getOnlineOrdersFromRouteDeliveryUOW = require('../../../uow/driverApp/route/getOnlineOrdersFromRouteDeliveryUOW');
const getStoreOrdersFromRouteDeliveryUOW = require('../../../uow/driverApp/route/getStoreOrdersFromRouteDeliveryUOW');

async function getRouteOrdersSummaryPipeline(payload) {
    const pipeline = new Pipeline([
        getRouteDeliveriesForRouteUOW,
        getOnlineOrdersFromRouteDeliveryUOW,
        getStoreOrdersFromRouteDeliveryUOW,
    ]);

    const result = await pipeline.run(payload);
    return result;
}

module.exports = exports = getRouteOrdersSummaryPipeline;
