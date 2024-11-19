const RouteDelivery = require('../../models/routeDeliveries');

async function getRouteDeliveryInfo(payload) {
    try {
        const { routeDeliveryId, driverId, transaction } = payload;

        const routeDelivery = await RouteDelivery.query(transaction)
            .withGraphFetched('orderDelivery.order.serviceOrder')
            .findById(routeDeliveryId)
            .withGraphJoined('route.store.settings')
            .where('route.driverId', driverId);

        if (!routeDelivery) {
            throw new Error('Route Delivery Not Found');
        }

        const originStore = routeDelivery.route.store;

        return {
            routeDelivery,
            routeId: routeDelivery.route.id,
            originStore,
            ...payload,
        };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getRouteDeliveryInfo;
