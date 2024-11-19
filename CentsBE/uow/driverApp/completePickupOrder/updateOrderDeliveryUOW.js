const OrderDelivery = require('../../../models/orderDelivery');
const Order = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');
const { orderDeliveryStatuses } = require('../../../constants/constants');

/**
 * update a status to 'EN_ROUTE_TO_DROP_OFF' for orderDelivery
 *
 * @param {Object} payload
 */

const serviceOrders = async (orderDelivery) => {
    const orders = await Order.query()
        .select('orderableId')
        .findById(orderDelivery.orderId)
        .andWhere('orderableType', 'ServiceOrder');
    const serviceOrder = await ServiceOrder.query().findById(orders.orderableId).returning('*');
    return serviceOrder;
};

async function updateOrderDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, routeDelivery } = newPayload;

        const orderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status: orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF,
            })
            .findById(routeDelivery.routableId)
            .returning('*');

        const serviceOrder = await serviceOrders(orderDelivery);

        newPayload.orderDelivery = orderDelivery;
        newPayload.serviceOrder = serviceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderDelivery;
