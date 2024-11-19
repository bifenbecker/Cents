const RouteDelivery = require('../../models/routeDeliveries');

async function getStoreFromRouteDeliveryUOW(payload) {
    try {
        const { transaction, routeDeliveryId, driverId } = payload;

        const routeDeliveryWithStore = await RouteDelivery.query(transaction)
            .withGraphJoined('[route.[store]]')
            .findById(routeDeliveryId)
            .where('route.driverId', driverId)
            .where('routableType', 'Store');

        if (!routeDeliveryWithStore) {
            throw Error('Route Delivery Not Found');
        }

        return {
            ...payload,
            destinationStoreId: routeDeliveryWithStore.routableId,
            originStore: routeDeliveryWithStore.route.store,
        };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getStoreFromRouteDeliveryUOW;
