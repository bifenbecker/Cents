const OrderDelivery = require('../../../../models/orderDelivery');
const { orderDeliveryStatuses } = require('../../../../constants/constants');

/**
 * Use incoming payload to mark an OrderDelivery as cancelled
 *
 * @param {Object} payload
 */
async function cancelDeliveryUow(payload) {
    try {
        const newPayload = payload;
        const { transaction, returnPayload } = newPayload;

        const returnId = returnPayload.id;

        await OrderDelivery.query(transaction)
            .patch({
                status: orderDeliveryStatuses.CANCELED,
                cancellationReason: 'CUSTOMER_CALLED_TO_CANCEL',
            })
            .findById(returnId);
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelDeliveryUow;
