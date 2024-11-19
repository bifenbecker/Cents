/* eslint-disable no-param-reassign */
const {
    routeDeliveryStatuses,
    hubOrderRouteDeliveryTypes: deliveryTypes,
} = require('../../../constants/constants');
const RouteDelivery = require('../../../models/routeDeliveries');
const getGoogleDistancePath = require('./getOptimizedRoutePath');
const OrderDelivery = require('../../../models/orderDelivery');
const Store = require('../../../models/store');

async function mapOrderDeliveries(orderDeliveryIds, routeId, transaction) {
    const orderDeliveries = await Promise.all(
        orderDeliveryIds.map(async (orderDeliveryId) => {
            const orderDeliveryDetails = await OrderDelivery.query(transaction)
                .withGraphJoined('centsCustomerAddress(addressDetails)')
                .modifiers({
                    addressDetails: (query) => {
                        query.select('lat', 'lng', 'id');
                    },
                })
                .where('orderDeliveries.id', orderDeliveryId)
                .first();
            return {
                routeId,
                routableId: orderDeliveryId,
                routableType: 'OrderDelivery',
                lat: orderDeliveryDetails.centsCustomerAddress.lat,
                lng: orderDeliveryDetails.centsCustomerAddress.lng,
                isPickup: orderDeliveryDetails.type === 'PICKUP',
                status: routeDeliveryStatuses.ASSIGNED,
            };
        }),
    );
    return orderDeliveries;
}

async function mapStores(stores, routeId, transaction, isOriginStoreHub) {
    const mappedStores = await Promise.all(
        stores.map(async (store) => {
            const storeDetails = await Store.query(transaction)
                .withGraphFetched('[settings(storeSettingsFilter)]')
                .modifiers({
                    storeSettingsFilter: (query) => {
                        query.select('lat', 'lng');
                    },
                })
                .where('id', store.storeId)
                .first();
            const payloadToInsert = {
                routeId,
                routableId: store.storeId,
                routableType: 'Store',
                lat: storeDetails.settings.lat,
                lng: storeDetails.settings.lng,
                status: routeDeliveryStatuses.ASSIGNED,
            };
            if (store.deliveryOrders && store.deliveryOrders.length) {
                store.deliveryOrders.forEach(async (order) => {
                    order.type = isOriginStoreHub ? deliveryTypes.TO_STORE : deliveryTypes.TO_HUB;
                    order.status = routeDeliveryStatuses.ASSIGNED;
                });
                payloadToInsert.serviceOrderRouteDeliveries = store.deliveryOrders;
            }
            return payloadToInsert;
        }),
    );
    return mappedStores;
}

/**
 * This function formats the routeDeliveries from orderDeliveryIds and storeIds
 * @param {Object} payload
 * @returns input payload along with the formatted routeDeliveries and orderDeliveries
 */
async function getRouteDeliveriesPayload(payload) {
    const { transaction, orderDeliveryIds, stores, routeId } = payload;
    let orderDeliveries;
    let storeOrders;
    if (orderDeliveryIds && orderDeliveryIds.length) {
        // fetching the orderDelivery details for routing
        orderDeliveries = await mapOrderDeliveries(orderDeliveryIds, routeId, transaction);
    }
    if (stores && stores.length) {
        // fetching residential or hub/spoke order details for routing
        storeOrders = await mapStores(stores, routeId, transaction, payload.currentStore.isHub);
    }
    return { orderDeliveries, storeOrders };
}

async function mappedRouteDeliveriesPath(routeDeliveries) {
    const firstOnlineOrderStop = routeDeliveries.find(
        (ele) => ele.routableType === 'OrderDelivery',
    );
    return routeDeliveries.map((routeDelivery, key) => {
        // const etaWithBuffer = routeDelivery.eta + 60 * 5 * key;
        const formattedPaylod = {
            routeId: routeDelivery.routeId,
            routableId: routeDelivery.routableId,
            routableType: routeDelivery.routableType,
            stopNumber: routeDelivery.stopNumber,
            // eta: etaWithBuffer,
            status: routeDelivery.status,
        };
        if (key === 0) {
            formattedPaylod.startedAt = new Date().toISOString();
        }
        if (firstOnlineOrderStop && firstOnlineOrderStop.stopNumber === routeDelivery.stopNumber) {
            formattedPaylod.status = routeDeliveryStatuses.IN_PROGRESS;
        }
        if (
            routeDelivery.routableType === 'Store' &&
            routeDelivery.serviceOrderRouteDeliveries &&
            routeDelivery.serviceOrderRouteDeliveries.length
        ) {
            formattedPaylod.serviceOrderRouteDeliveries = routeDelivery.serviceOrderRouteDeliveries;
        }
        return formattedPaylod;
    });
}

/**
 * This function takes the currentStoreAddress from the payload and formats destinationAddress
 * with the currentStoreAddress and destinationsAddress we fetch the googleDistanceMatrix
 * and will add the eta to the routeDeliveries
 *
 * Update March 2022:
 * ETA won't be generated here. It will be generated on the fly by the driver when
 * he tries to open the maps application from driver app. This will also happen only
 * for order deliveries and not store stops.
 * @param {Object} payload
 * @returns returns the liveRoute created
 */
async function getOptimizedLiveRoute(payload) {
    const { driverLat, driverLng, currentStore } = payload;
    let driverLocationAddress = [driverLat, driverLng];
    if (process.env.NODE_ENV === 'development') {
        driverLocationAddress = [currentStore.settings.lat, currentStore.settings.lng];
    }
    const { orderDeliveries = [], storeOrders = [] } = await getRouteDeliveriesPayload(payload);
    const routeDeliveryStops = orderDeliveries.concat(storeOrders);
    const destinationAddresses = routeDeliveryStops.map((stop) => [stop.lat, stop.lng]);
    // fetching the optimized route
    const routeDeliveries = await getGoogleDistancePath(
        driverLocationAddress,
        destinationAddresses,
        routeDeliveryStops,
        payload.timezone || 'UTC',
    );
    payload.orderDeliveries = orderDeliveries;
    return mappedRouteDeliveriesPath(routeDeliveries);
}

async function createRouteDeliveryUow(payload) {
    const newPayload = payload;

    const routeDeliveriespath = await getOptimizedLiveRoute(payload);
    const firstRouteDelivery = routeDeliveriespath[0];
    if (!firstRouteDelivery) {
        throw new Error('No available stops for route');
    }
    newPayload.routeDeliveriespath = routeDeliveriespath;

    await Promise.all(
        // adding the route to the route deliveries table
        routeDeliveriespath.map(async (routeDelivery) => {
            if (routeDelivery.routableType === 'Store') {
                if (
                    routeDelivery.serviceOrderRouteDeliveries &&
                    routeDelivery.serviceOrderRouteDeliveries.length
                ) {
                    await RouteDelivery.query(payload.transaction).insertGraph(routeDelivery);
                } else {
                    await RouteDelivery.query(payload.transaction).insert(routeDelivery);
                }
            } else {
                await RouteDelivery.query(payload.transaction).insert(routeDelivery);
            }
        }),
    );
    return newPayload;
}

module.exports = exports = { createRouteDeliveryUow, mapOrderDeliveries };
