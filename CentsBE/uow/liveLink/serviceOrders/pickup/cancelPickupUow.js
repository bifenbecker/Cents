const OrderDelivery = require('../../../../models/orderDelivery');
const { orderDeliveryStatuses, statuses } = require('../../../../constants/constants');
const ServiceOrder = require('../../../../models/serviceOrders');

/**
 * Use incoming payload to mark an OrderDelivery as cancelled
 *
 * @param {Object} payload
 */
async function cancelPickupUow(payload) {
    try {
        const newPayload = payload;
        const { transaction, pickupPayload, serviceOrder, serviceOrderId } = newPayload;

        const pickupId = pickupPayload.id;

        await OrderDelivery.query(transaction)
            .patch({
                status: orderDeliveryStatuses.CANCELED,
                cancellationReason: 'CUSTOMER_CALLED_TO_CANCEL',
            })
            .findById(pickupId)
            .where('type', 'PICKUP')
            .andWhere('orderId', serviceOrder.masterOrderId)
            .returning('*');
        const returnDelivery = await OrderDelivery.query(transaction)
            .where({
                orderId: serviceOrder.masterOrderId,
                type: 'RETURN',
            })
            .first();
        if (returnDelivery) {
            // canceling return delivery if it is created
            await returnDelivery.$query(transaction).patch({
                status: orderDeliveryStatuses.CANCELED,
                cancellationReason: 'CUSTOMER_CALLED_TO_CANCEL',
            });
        }
        // canceling the serviceOrder when pickup is canceled
        await ServiceOrder.query(transaction)
            .patch({
                status: statuses.CANCELLED,
            })
            .findById(serviceOrderId);
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelPickupUow;
