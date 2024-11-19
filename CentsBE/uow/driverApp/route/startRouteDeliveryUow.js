// const moment = require('moment-timezone');
const updateServiceOrderStatus = require('./updateServiceOrderStatus');
const OrderDelivery = require('../../../models/orderDelivery');
const eventEmitter = require('../../../config/eventEmitter');
const { statuses, orderSmsEvents, orderDeliveryStatuses } = require('../../../constants/constants');

async function updateStoreRouteDeliveryStatus(
    routeDelivery,
    timezone,
    isHub,
    driverId,
    transaction,
) {
    const { serviceOrderRouteDeliveries } = routeDelivery;
    if (serviceOrderRouteDeliveries && serviceOrderRouteDeliveries.length) {
        const serviceOrderIds = serviceOrderRouteDeliveries.map((order) => order.serviceOrderId);
        let status = '';
        if (isHub) {
            status = statuses.IN_TRANSIT_TO_STORE;
            // await Promise.all(
            //     serviceOrderRouteDeliveries.map(async (order) => {
            //         const eta = moment.unix(routeDelivery.eta).tz(timezone).format('h:mm a');
            //         eventEmitter.emit(
            //             'orderSmsNotification',
            //             orderSmsEvents.IN_TRANSIT_TO_STORE,
            //             order.serviceOrderId,
            //             { eta },
            //         );
            //     }),
            // );
        } else {
            status = statuses.IN_TRANSIT_TO_HUB;
        }
        await updateServiceOrderStatus(serviceOrderIds, status, driverId, transaction);
    }
}

async function getOrderDelivery(orderDeliveryId, transaction) {
    const orderDelivery = await OrderDelivery.query(transaction)
        .withGraphFetched('[order.[serviceOrder.[storeCustomer]]]')
        .where('id', orderDeliveryId)
        .first()
        .returning('id', 'orderId', 'customerName', 'customerPhoneNumber', 'type');
    return orderDelivery;
}

async function updateOrderDeliveryStatus(routeDelivery, timezone, driverId, transaction) {
    let status = '';
    const orderDelivery = await getOrderDelivery(routeDelivery.routableId, transaction);
    const { orderableId, serviceOrder } = orderDelivery.order;

    const { stopNumber } = routeDelivery;

    if (orderDelivery.type === 'PICKUP') {
        status = orderDeliveryStatuses.EN_ROUTE_TO_PICKUP;
        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.EN_ROUTE_TO_PICKUP,
            serviceOrder.id,
            { stopNumber },
        );
    } else {
        status = orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF;
        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.EN_ROUTE_TO_DROP_OFF,
            serviceOrder.id,
            { stopNumber },
        );
        const { EN_ROUTE_TO_CUSTOMER } = statuses;
        await updateServiceOrderStatus([orderableId], EN_ROUTE_TO_CUSTOMER, driverId, transaction);
    }
    await OrderDelivery.query(transaction)
        .patch({
            status,
        })
        .where('id', orderDelivery.id);
}

async function startRouteDelivery(payload) {
    const newPayload = payload;
    const { transaction, currentStore, driverId, routeDeliveriespath } = payload;
    const timezone = currentStore.settings.timeZone || 'UTC';
    const { isHub } = currentStore;
    await Promise.all(
        routeDeliveriespath.map(async (routeDelivery) => {
            switch (routeDelivery.routableType) {
                case 'Store':
                    await updateStoreRouteDeliveryStatus(
                        routeDelivery,
                        timezone,
                        isHub,
                        driverId,
                        transaction,
                    );
                    break;
                default:
                    await updateOrderDeliveryStatus(routeDelivery, timezone, driverId, transaction);
                    break;
            }
        }),
    );
    return newPayload;
}

module.exports = exports = startRouteDelivery;
