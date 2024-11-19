const OrderDelivery = require('../../../models/orderDelivery');
const { orderDeliveryStatuses, uberCancellationReasons } = require('../../../constants/constants');

/**
 * Use incoming payload to mark an OrderDelivery as cancelled
 *
 * @param {Object} payload
 */
async function cancelOrderDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDeliveryId, cancellationReason } = newPayload;

        const orderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status: orderDeliveryStatuses.CANCELED,
                cancellationReason:
                    cancellationReason || uberCancellationReasons.CUSTOMER_CALLED_TO_CANCEL,
            })
            .findById(orderDeliveryId)
            .returning('*');
        newPayload.orderDelivery = orderDelivery;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelOrderDelivery;
