const { raw } = require('objection');
const { routeDeliveryStatuses } = require('../../../constants/constants');
const OrderDelivery = require('../../../models/orderDelivery');
const getOrderCodePrefix = require('../../../utils/getOrderCodePrefix');

async function getOnlineOrdersFromRouteDeliveryUOW(payload) {
    const { transaction, orderDeliveryRouteDeliveries } = payload;

    const orderDeliveryIds = [];

    for (const routeDelivery of orderDeliveryRouteDeliveries) {
        if (routeDelivery.status === routeDeliveryStatuses.PICKED_UP) {
            orderDeliveryIds.push(routeDelivery.orderDelivery.id);
        }
    }

    const cancelledOrderDeliveries = orderDeliveryRouteDeliveries
        .filter(
            (routeDelivery) =>
                routeDelivery.status === routeDeliveryStatuses.CANCELED &&
                routeDelivery.orderDelivery.type === 'RETURN',
        )
        .map((routeDelivery) => routeDelivery.orderDelivery.id);

    const onlinePickupOrders = await OrderDelivery.query(transaction)
        .select(
            'order:serviceOrder.id',
            'order:serviceOrder.orderCode',
            'order:serviceOrder:store.name as storeName',
            'order:serviceOrder.orderType',
            raw('count("order:serviceOrder:serviceOrderBags".id)::integer as "bagsCount"'),
        )
        .joinRelated('order.serviceOrder.[serviceOrderBags, store]')
        .where('orderDeliveries.type', 'PICKUP')
        .whereIn('orderDeliveries.id', orderDeliveryIds)
        .groupBy(1, 2, 3, 4);

    const onlineCancelledDeliveries = await OrderDelivery.query(transaction)
        .select(
            'order:serviceOrder.id',
            'order:serviceOrder.orderCode',
            'order:serviceOrder:store.name as storeName',
            'order:serviceOrder.orderType',
            raw('count("order:serviceOrder:serviceOrderBags".id)::integer as "bagsCount"'),
        )
        .joinRelated('order.serviceOrder.[serviceOrderBags, store]')
        .where('orderDeliveries.type', 'RETURN')
        .whereIn('orderDeliveries.id', cancelledOrderDeliveries)
        .groupBy(1, 2, 3, 4);
    const cancelledDeliveries = (onlineCancelledDeliveries || []).map((order) => ({
        id: order.id,
        orderCode: getOrderCodePrefix(order),
        bagsCount: order.bagsCount,
    }));

    const online = (onlinePickupOrders || []).map((order) => ({
        id: order.id,
        orderCode: getOrderCodePrefix(order),
        bagsCount: order.bagsCount,
    }));

    return {
        online,
        cancelledDeliveries,
        ...payload,
    };
}

module.exports = exports = getOnlineOrdersFromRouteDeliveryUOW;
