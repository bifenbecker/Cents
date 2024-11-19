async function getRouteDeliveriesForRouteUOW(payload) {
    const { route } = payload;

    const orderDeliveryRouteDeliveries = route.routeDeliveries.filter(
        (routeDelivery) => routeDelivery.routableType === 'OrderDelivery',
    );

    const storeRouteDeliveries = route.routeDeliveries.filter(
        (routeDelivery) => routeDelivery.routableType === 'Store',
    );

    return { ...payload, orderDeliveryRouteDeliveries, storeRouteDeliveries };
}

module.exports = exports = getRouteDeliveriesForRouteUOW;
