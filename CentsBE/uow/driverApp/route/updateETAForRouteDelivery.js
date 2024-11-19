/* eslint-disable no-param-reassign */
const getGoogleDistancePath = require('./getOptimizedRoutePath');
const { mapOrderDeliveries } = require('./createRouteDeliveryUow');
const { unixDateFormat } = require('../../../helpers/dateFormatHelper');

async function updateETAForRouteDelivery(payload) {
    const newPayload = payload;
    const { routeDelivery, originStore } = payload;
    if (!routeDelivery || !routeDelivery.orderDelivery) {
        return payload;
    }
    newPayload.routeId = routeDelivery.routeId;
    newPayload.serviceOrder = routeDelivery.orderDelivery.order.serviceOrder;
    newPayload.timezone = originStore.settings.timeZone;
    let driverLocationAddress;
    const { driverLat, driverLng } = payload;
    driverLocationAddress = [driverLat, driverLng];
    if (process.env.NODE_ENV === 'development') {
        driverLocationAddress = [originStore.settings.lat, originStore.settings.lng];
    }
    newPayload.orderDeliveryIds = [routeDelivery.orderDelivery.id];
    const orderDeliveries = await mapOrderDeliveries(
        newPayload.orderDeliveryIds,
        newPayload.routeId,
    );
    payload.orderDeliveries = orderDeliveries;
    const destinationAddresses = orderDeliveries.map((stop) => [stop.lat, stop.lng]);
    // fetching the optimized route
    const routeDeliveries = await getGoogleDistancePath(
        driverLocationAddress,
        destinationAddresses,
        orderDeliveries,
        payload.timezone || 'UTC',
    );
    const etaWithBuffer = routeDeliveries[0].eta + 60 * 5;
    await routeDelivery.$query().update({
        eta: etaWithBuffer,
    });
    newPayload.formattedETA = unixDateFormat(routeDelivery.eta, payload.timezone, 'h:mm a');
    return newPayload;
}

module.exports = exports = updateETAForRouteDelivery;
