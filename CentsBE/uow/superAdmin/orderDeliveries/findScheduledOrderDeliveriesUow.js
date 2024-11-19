const Order = require('../../../models/orders');
const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Identify any scheduled deliveries for a given ServiceOrder
 *
 * @param {Object} payload
 */
async function findScheduledOrderDeliveries(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrderId, status } = newPayload;

        if (status !== 'CANCELLED') {
            return newPayload;
        }

        const order = await Order.query(transaction).findOne({
            orderableId: serviceOrderId,
            orderableType: 'ServiceOrder',
        });
        const statuses = ['SCHEDULED', 'INTENT_CREATED'];
        const scheduledDeliveries = await OrderDelivery.query(transaction)
            .where({
                orderId: order.id,
            })
            .whereIn('status', statuses);

        newPayload.scheduledDeliveries = scheduledDeliveries;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = findScheduledOrderDeliveries;
