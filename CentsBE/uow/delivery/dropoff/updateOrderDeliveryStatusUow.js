const { orderDeliveryStatuses } = require('../../../constants/constants');
const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Use incoming payload to update the status of the OrderDelivey model.
 *
 * @param {Object} payload
 */
async function updateOrderDeliveryStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, thirdPartyDeliveryId, status } = newPayload;

        const updatedOrderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status,
                deliveredAt:
                    status === orderDeliveryStatuses.COMPLETED ? new Date().toISOString() : null,
            })
            .where({
                thirdPartyDeliveryId,
            })
            .returning('*')
            .first();

        newPayload.orderDelivery = updatedOrderDelivery;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderDeliveryStatus;
