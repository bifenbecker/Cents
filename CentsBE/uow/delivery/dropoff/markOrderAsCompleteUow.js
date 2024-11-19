const Order = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');
const ServiceOrderItem = require('../../../models/serviceOrderItem');

/**
 * Update the status of the individual OrderItem
 *
 * @param {Number} orderItemId
 * @param {void} transaction
 */
async function updateServiceOrderItem(orderItemId, transaction) {
    await ServiceOrderItem.query(transaction)
        .patch({
            status: 'COMPLETED',
        })
        .findById(orderItemId);
}

/**
 * Use incoming payload to update the existing ServiceOrder model.
 *
 * @param {Object} payload
 */
async function markOrderAsComplete(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;
        let { serviceOrder = {} } = newPayload;

        const order = await Order.query(transaction).findById(newPayload.orderDelivery.orderId);
        newPayload.order = order;

        if (newPayload.orderDelivery.type === 'PICKUP') {
            serviceOrder = await ServiceOrder.query(transaction)
                .withGraphFetched('orderItems')
                .patch({
                    status: 'READY_FOR_INTAKE',
                    pickupDeliveryFee: serviceOrder.pickupDeliveryFee,
                })
                .findById(order.orderableId)
                .returning('*');
            newPayload.serviceOrder = serviceOrder;
            newPayload.serviceOrderItems = serviceOrder.orderItems;
            return newPayload;
        }

        serviceOrder = await ServiceOrder.query(transaction)
            .patch({
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                completedAt: new Date().toISOString(),
                returnDeliveryFee: serviceOrder.returnDeliveryFee,
            })
            .findById(order.orderableId)
            .returning('*');

        const serviceOrderItems = await ServiceOrderItem.query(transaction).where({
            orderId: serviceOrder.id,
        });

        let updatedServiceOrderItems = serviceOrderItems.map((item) =>
            updateServiceOrderItem(item.id, transaction),
        );

        updatedServiceOrderItems = await Promise.all(updatedServiceOrderItems);

        newPayload.serviceOrder = serviceOrder;
        newPayload.serviceOrderItems = updatedServiceOrderItems;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = markOrderAsComplete;
