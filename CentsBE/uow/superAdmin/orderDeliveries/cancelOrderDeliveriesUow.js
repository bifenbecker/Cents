const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Cancel the scheduled OrderDelivery
 *
 * @param {Object} orderDelivery
 * @param {void} transaction
 */
async function cancelOrderDelivery(orderDelivery, transaction) {
    const canceledDelivery = await OrderDelivery.query(transaction)
        .patch({
            status: 'CANCELED',
            cancellationReason: 'INTERNAL_MANAGER_CANCELLATION',
        })
        .findById(orderDelivery.id)
        .returning('*');
    return canceledDelivery;
}

/**
 * Identify any scheduled deliveries for a given ServiceOrder
 *
 * @param {Object} payload
 */
async function cancelOrderDeliveries(payload) {
    try {
        const newPayload = payload;
        const { transaction, scheduledDeliveries, status } = newPayload;

        if (status !== 'CANCELLED') {
            return newPayload;
        }

        if (scheduledDeliveries.length === 0) {
            return newPayload;
        }

        let canceledOrderDeliveries = scheduledDeliveries.map((delivery) =>
            cancelOrderDelivery(delivery, transaction),
        );
        canceledOrderDeliveries = await Promise.all(canceledOrderDeliveries);
        newPayload.canceledOrderDeliveries = canceledOrderDeliveries;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelOrderDeliveries;
