// Model
const Payment = require('../../../models/payment');

// Constants && Helpers
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Update the Payment object using the Stripe PaymentIntent information
 *
 * @param {Object} payload
 */
async function updatePaymentForCapturedPaymentIntent(payload) {
    try {
        const newPayload = payload;
        const { webhookType, payment, transaction, paymentIntent } = newPayload;

        if (webhookType !== STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED) {
            return newPayload;
        }

        if (!paymentIntent || paymentIntent?.status !== 'succeeded') {
            return newPayload;
        }

        const updatedPayment = await Payment.query(transaction)
            .patch({
                status: paymentIntent.status,
                totalAmount: Number(paymentIntent.amount / 100),
            })
            .findById(payment.id)
            .returning('*');
        newPayload.payment = updatedPayment;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside updatePaymentForCapturedPaymentIntent', error);
        throw Error(error.message);
    }
}

module.exports = exports = updatePaymentForCapturedPaymentIntent;
