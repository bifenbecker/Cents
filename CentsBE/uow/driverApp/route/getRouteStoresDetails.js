const { raw } = require('objection');
const moment = require('moment-timezone');
const RouteDeliveries = require('../../../models/routeDeliveries');
const { statuses } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

function getAvailableDeliveriesCount(serviceOrderRouteDeliveries, currentStore) {
    let serviceOrderDeliveries = [];
    if (serviceOrderRouteDeliveries.length) {
        if (currentStore.isHub) {
            serviceOrderDeliveries = serviceOrderRouteDeliveries.filter(
                (sRouteDelivery) =>
                    sRouteDelivery.serviceOrder.status === statuses.HUB_PROCESSING_COMPLETE ||
                    sRouteDelivery.serviceOrder.status === statuses.IN_TRANSIT_TO_STORE,
            );
        } else {
            serviceOrderDeliveries = serviceOrderRouteDeliveries.filter(
                (sRouteDelivery) =>
                    sRouteDelivery.serviceOrder.status ===
                        statuses.DESIGNATED_FOR_PROCESSING_AT_HUB ||
                    sRouteDelivery.serviceOrder.status === statuses.IN_TRANSIT_TO_HUB,
            );
        }
    }
    return serviceOrderDeliveries.length;
}

/**
 * getRouteDetails
 * @param {Object} payload
 */
async function getRouteStoresDetails(payload) {
    try {
        const { routeDetails } = payload;
        const { currentStore } = payload;
        let availablePickupsQuery;
        const pickupType = currentStore.isHub ? 'TO_HUB' : 'TO_STORE';
        const deliveryType = currentStore.isHub ? 'TO_STORE' : 'TO_HUB';
        if (currentStore.isHub) {
            availablePickupsQuery = `(SELECT count(*) FROM "serviceOrders" WHERE "status"='${statuses.DESIGNATED_FOR_PROCESSING_AT_HUB}' AND "storeId"="routeDeliveries"."routableId" AND "hubId"=${currentStore.id})`;
        } else {
            availablePickupsQuery = `(SELECT count(*) FROM "serviceOrders" WHERE "status"='${statuses.HUB_PROCESSING_COMPLETE}' AND "hubId"="routeDeliveries"."routableId" AND "storeId"=${currentStore.id})`;
        }
        const pickupsCompletedQuery = `(SELECT count(*) FROM "serviceOrderRouteDeliveries" WHERE  "type"='${pickupType}' AND "routeDeliveryId" = "routeDeliveries".id AND "serviceOrderRouteDeliveries"."status" IN ('DROPPED_OFF', 'PICKED_UP'))::INTEGER `;
        const deliveriesCompletedQuery = `(SELECT count(*) FROM "serviceOrderRouteDeliveries" WHERE "type"='${deliveryType}' AND "routeDeliveryId"="routeDeliveries".id AND "serviceOrderRouteDeliveries"."status"='DROPPED_OFF')::INTEGER`;
        const result = await RouteDeliveries.query(payload.transaction)
            .select(
                'routeDeliveries.id',
                'routeId',
                'eta',
                'stopNumber',
                'routableType',
                'routableId',
                'routeDeliveries.status',
                'routeDeliveries.completedAt',
                raw(availablePickupsQuery).as('pickupsAvailable'),
                raw(pickupsCompletedQuery).as('pickupCompleted'),
                raw(deliveriesCompletedQuery).as('deliveriesCompleted'),
            )
            .withGraphJoined(
                '[store(storeModifier).[settings], serviceOrderRouteDeliveries.serviceOrder(serviceOrderModifier).serviceOrderBags]',
            )
            .modifiers({
                storeModifier: (query) =>
                    query.select(
                        'id',
                        'name',
                        'address',
                        'isHub',
                        'type',
                        'city',
                        'state',
                        raw('CASE WHEN "type" = \'RESIDENTIAL\' THEN true ELSE false END').as(
                            'isResidential',
                        ),
                    ),
                serviceOrderModifier: (query) => query.select('id', 'orderCode', 'status'),
            })
            .eagerOptions({ minimize: true })
            .where('routeId', payload.routeId)
            .where('routableType', 'Store');
        const timezone = payload.currentStore.settings.timeZone;
        const totalPickupsCompleted = result.reduce(
            (acc, routeDelivery) => acc + routeDelivery.pickupCompleted,
            0,
        );
        const totalDeliveriesCompleted = result.reduce(
            (acc, routeDelivery) => acc + +routeDelivery.deliveriesCompleted,
            0,
        );
        const routeDeliveries = result.map((rDelivery) => ({
            id: rDelivery.id,
            status: rDelivery.status,
            eta: rDelivery.eta
                ? moment
                      .unix(+rDelivery.eta)
                      .tz(timezone)
                      .format('h:mm a')
                : null,
            stopNumber: rDelivery.stopNumber,
            routableId: rDelivery.routableId,
            routableType: rDelivery.routableType,
            completedAt: rDelivery.completedAt
                ? moment(rDelivery.completedAt).tz(timezone).format('h:mm a')
                : null,
            store: {
                id: rDelivery.store.id,
                name: rDelivery.store.name,
                address: {
                    address: rDelivery.store.address,
                    city: rDelivery.store.city,
                    state: rDelivery.store.state,
                    zipCode: rDelivery.store.zipCode,
                    lat: rDelivery.store.settings.lat,
                    lng: rDelivery.store.settings.lng,
                },
                isHub: rDelivery.store.isHub,
                type: rDelivery.store.type,
                isResidential: rDelivery.store.isResidential,
            },
            totalOrders: rDelivery.totalOrders,
            pickup: {
                available: +rDelivery.pickupsAvailable,
                completed: +rDelivery.pickupCompleted,
            },
            delivery: {
                available: getAvailableDeliveriesCount(
                    rDelivery.serviceOrderRouteDeliveries,
                    currentStore,
                ),
                completed: +rDelivery.deliveriesCompleted,
            },
        }));
        routeDetails.routeDeliveries = routeDetails.routeDeliveries
            .concat(routeDeliveries)
            .sort((a, b) => a.stopNumber - b.stopNumber);
        const newPayload = payload;
        routeDetails.completed.pickups += totalPickupsCompleted;
        routeDetails.completed.deliveries += totalDeliveriesCompleted;
        newPayload.routeDetails = routeDetails;
        return newPayload;
    } catch (err) {
        LoggerHandler('error', `Error in getRouteStoreDetails uow ${JSON.stringify(err)}`, payload);
        throw err;
    }
}

module.exports = getRouteStoresDetails;
