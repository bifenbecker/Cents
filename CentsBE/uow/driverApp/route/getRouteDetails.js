const moment = require('moment-timezone');
const Route = require('../../../models/route');
const ServiceOrder = require('../../../models/serviceOrders');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');
const { routeDeliveryStatuses } = require('../../../constants/constants');

// const RouteDeliveries = require('../../../models/routeDeliveries');

function getCompletedPickupsLength(routeDeliveries) {
    return routeDeliveries.filter(
        (routeDelivery) =>
            routeDelivery.orderDelivery.type === 'PICKUP' &&
            routeDelivery.status === routeDeliveryStatuses.COMPLETED,
    ).length;
}

function getCompletedDeliveriesLength(routeDeliveries) {
    return routeDeliveries.filter(
        (routeDelivery) =>
            routeDelivery.orderDelivery.type === 'RETURN' &&
            routeDelivery.status === routeDeliveryStatuses.COMPLETED,
    ).length;
}

function getCompletedTime(routeDelivery, timezone) {
    let completedAt;
    switch (routeDelivery.status) {
        case 'CANCELED':
            completedAt = moment(routeDelivery.updatedAt).tz(timezone).format('h:mm a');
            break;
        default:
            completedAt = routeDelivery.completedAt
                ? moment(routeDelivery.completedAt).tz(timezone).format('h:mm a')
                : null;
            break;
    }
    return completedAt;
}
/**
 * getRouteDetails
 * @param {Object} payload
 */
async function getRouteDetails(payload) {
    const newPayload = payload;
    const result = await Route.query(payload.transaction)
        .withGraphJoined(
            '[store.settings, timing, routeDeliveries(routeDeliveryModifier).orderDelivery.[customer(customerModifier), centsCustomerAddress, order(orderModifier).serviceOrder(serviceOrderModifier).serviceOrderBags]]',
        )
        .modifiers({
            customerModifier: (query) => query.select('firstName', 'lastName', 'phoneNumber'),
            orderModifier: (query) =>
                query
                    .select('id', 'orderableType', 'orderableId')
                    .whereIn('orderableType', ['serviceOrder', 'ServiceOrder']),
            serviceOrderModifier: (query) =>
                query.select(
                    'id',
                    'orderCode',
                    'orderType',
                    'status',
                    ServiceOrder.relatedQuery('serviceOrderBags').count().as('bagsCount'),
                ),
            routeDeliveryModifier: (query) =>
                query
                    .select(
                        'id',
                        'status',
                        'eta',
                        'stopNumber',
                        'routableId',
                        'routableType',
                        'updatedAt',
                        'completedAt',
                        'imageUrl',
                    )
                    .where('routableType', 'OrderDelivery'),
        })
        .eagerOptions({ minimize: true })
        .where('route.id', payload.routeId)
        .first();
    const timezone = result.store.settings.timeZone || 'UTC';
    result.window = `${moment.utc(result.timing.startTime).format('h:mm A')} - ${moment
        .utc(result.timing.endTime)
        .format('h:mm A')}`;
    result.routeDeliveries = result.routeDeliveries.map((rDelivery) => ({
        id: rDelivery.id,
        status: rDelivery.status,
        eta: rDelivery.eta
            ? moment
                  .unix(+rDelivery.eta)
                  .tz(timezone)
                  .format('h:mm a')
            : null,
        stopNumber: rDelivery.stopNumber,
        routableType: rDelivery.routableType,
        routableId: rDelivery.routableId,
        imageUrl: rDelivery.imageUrl,
        completedAt: getCompletedTime(rDelivery, timezone),
        orderDelivery: {
            id: rDelivery.orderDelivery.id,
            status: rDelivery.orderDelivery.status,
            customer: rDelivery.orderDelivery.customer,
            orderCode: getOrderCodePrefix(rDelivery.orderDelivery.order.serviceOrder),
            bagsCount: rDelivery.orderDelivery.order.serviceOrder.serviceOrderBags.length,
            address: {
                ...rDelivery.orderDelivery.centsCustomerAddress,
                lat: Number(rDelivery.orderDelivery.centsCustomerAddress.lat),
                lng: Number(rDelivery.orderDelivery.centsCustomerAddress.lng),
            },
            type: rDelivery.orderDelivery.type,
            instructions: rDelivery.orderDelivery.instructions,
            cancellationReason: rDelivery.orderDelivery.cancellationReason,
            // TODO: bagCount yet to add
        },
    }));
    result.createdAt = moment(result.createdAt).tz(timezone).format('MM/DD/YYYY');
    if (result.completedAt) {
        result.completedAt = moment(result.completedAt).tz(timezone).format('MM/DD/YY, h:mm a');
    }
    result.completed = {
        pickups: getCompletedPickupsLength(result.routeDeliveries),
        deliveries: getCompletedDeliveriesLength(result.routeDeliveries),
    };
    newPayload.routeDetails = result;
    newPayload.timeZone = result.store.settings.timeZone;
    newPayload.currentStore = result.store;
    delete newPayload.routeDetails.store;
    delete newPayload.routeDetails.timing;
    return newPayload;
}

module.exports = getRouteDetails;
