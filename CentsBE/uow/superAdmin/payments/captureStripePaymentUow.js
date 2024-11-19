const stripe = require('../../../routes/stripe/config');
const Payment = require('../../../models/payment');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Use the incoming payment object to properly confirm a payment in Stripe (if necessary).
 *
 * @param {Object} payload
 */
async function captureStripePayment(payload) {
    try {
        const newPayload = payload;
        const { payment, transaction } = newPayload;

        if (payment.status === 'succeeded' || payment.status !== 'requires_capture') {
            return newPayload;
        }

        const capturedPayment = await stripe.paymentIntents.capture(payment.paymentToken);
        const updatedPayment = await Payment.query(transaction)
            .patch({
                status: capturedPayment.status,
            })
            .findById(payment.id)
            .returning('*');

        newPayload.stripePayment = capturedPayment;
        newPayload.payment = updatedPayment;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', `Error when capturing Stripe payment: ${error.message}`, payload);
        throw Error(error.message);
    }
}

module.exports = exports = captureStripePayment;
