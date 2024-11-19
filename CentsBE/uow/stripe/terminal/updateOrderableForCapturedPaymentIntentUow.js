// Constants && Helpers
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Update the Orderable model using the incoming payment information
 *
 * @param {Object} payload
 */
async function updateOrderableForCapturedPaymentIntent(payload) {
    try {
        const newPayload = payload;
        const { webhookType, payment, transaction, paymentIntent, order } = newPayload;

        if (webhookType !== STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED) {
            return newPayload;
        }

        if (!paymentIntent || paymentIntent?.status !== 'succeeded') {
            return newPayload;
        }

        if (payment?.status !== 'succeeded') {
            return newPayload;
        }

        if (!order) {
            return newPayload;
        }

        const modelToUse = order.getOrderableModelClass();
        const orderModel = await modelToUse.query(transaction).findById(order?.orderableId);
        const previousBalanceDue = Number(orderModel.balanceDue);
        const newBalanceDue = Number(previousBalanceDue - payment.totalAmount);

        await modelToUse
            .query(transaction)
            .patch({
                paymentStatus: newBalanceDue > 0 ? 'BALANCE_DUE' : 'PAID',
                balanceDue: newBalanceDue,
            })
            .findById(order?.orderableId)
            .returning('*');

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside updateOrderableForCapturedPaymentIntent', error);
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderableForCapturedPaymentIntent;
