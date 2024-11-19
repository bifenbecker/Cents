const OrderDelivery = require('../../../models/orderDelivery');
const Order = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');
const StoreCustomer = require('../../../models/storeCustomer');
const { orderDeliveryStatuses } = require('../../../constants/constants');
const computeDeliveryFee = require('../../../pipeline/delivery/estimate/computeDeliveryFee');

/**
 * update a status to 'COMPLETED' for orderDelivery
 *
 * @param {Object} payload
 */

async function serviceOrders(orderDelivery) {
    const orders = await Order.query()
        .select('orderableId')
        .findById(orderDelivery.orderId)
        .andWhere('orderableType', 'ServiceOrder');
    const serviceOrder = await ServiceOrder.query().findById(orders.orderableId).returning('*');
    return serviceOrder;
}

async function updateOrderDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, routeDelivery } = newPayload;

        const orderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status: orderDeliveryStatuses.COMPLETED,
                deliveredAt: new Date().toISOString(),
            })
            .findById(routeDelivery.routableId)
            .returning('*');

        const serviceOrder = await serviceOrders(orderDelivery);
        const storeCustomer = await StoreCustomer.query(transaction).findById(
            serviceOrder.storeCustomerId,
        );
        const deliveryFeeInfo = await computeDeliveryFee({
            storeId: serviceOrder.storeId,
            currentCustomer: { id: storeCustomer.centsCustomerId },
            orderId: orderDelivery.orderId,
        });

        newPayload.orderDelivery = orderDelivery;
        newPayload.serviceOrder = serviceOrder;
        newPayload.previousTotalDeliveryCost = orderDelivery.totalDeliveryCost || 0;
        newPayload.newTotalDeliveryCost = deliveryFeeInfo.ownDeliveryStore.deliveryFeeInCents;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderDelivery;
