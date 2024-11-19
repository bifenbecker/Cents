const OrderActivityLog = require('../../../models/orderActivityLog');
const { statuses, origins } = require('../../../constants/constants');

/**
 * Mark the "READY_FOR_DRIVER_PICKUP" OrderActivityLog as deleted
 *
 * @param {Object} payload
 */
async function deleteDeliveryOrderActivityLog(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        await OrderActivityLog.query(transaction)
            .patch({ deletedAt: new Date().toISOString() })
            .where({
                orderId: serviceOrder.id,
                status: statuses.READY_FOR_DRIVER_PICKUP,
                origin: origins.DRIVER_APP,
            })
            .returning('*');

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = deleteDeliveryOrderActivityLog;
