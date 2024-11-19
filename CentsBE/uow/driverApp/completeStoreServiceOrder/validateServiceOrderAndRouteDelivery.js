const RouteDelivery = require('../../../models/routeDeliveries');
const ServiceOrder = require('../../../models/serviceOrders');
const {
    routeDeliveryStatuses: deliveryStatus,
    orderDeliveryStatuses: orderStatuses,
} = require('../../../constants/constants');

async function validateServiceOrder(payload) {
    const newPayload = payload;
    const { transaction, serviceOrderId } = payload;
    const serviceOrder = await ServiceOrder.query(transaction)
        .where('id', serviceOrderId)
        .whereNotIn('status', [orderStatuses.COMPLETED, orderStatuses.CANCELED])
        .first();
    if (!serviceOrder) {
        throw new Error('Service order not found');
    }
    return newPayload;
}

async function validateRouteDelivery(payload) {
    const newPayload = payload;
    const { transaction, routeDeliveryId } = payload;
    const routeDelivery = await RouteDelivery.query(transaction)
        .where('id', routeDeliveryId)
        .whereNotIn('status', [deliveryStatus.CANCELED])
        .first();
    if (!routeDelivery) {
        throw new Error('Route delivery not found');
    }
    return newPayload;
}

module.exports = {
    validateServiceOrder,
    validateRouteDelivery,
};
