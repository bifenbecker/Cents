const stripe = require('../../../routes/stripe/config');
const Payment = require('../../../models/payment');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Use the incoming payment object to properly confirm a payment in Stripe (if necessary)
 * and update the Payment object accordingly
 *
 * @param {Object} payload
 */
async function confirmStripePayment(payload) {
    try {
        const newPayload = payload;
        const { payment, transaction } = newPayload;

        if (payment.status !== 'requires_confirmation') {
            return newPayload;
        }

        const stripePayment = await stripe.paymentIntents.confirm(payment.paymentToken);
        const updatedPayment = await Payment.query(transaction)
            .patch({
                status: stripePayment.status,
            })
            .findById(payment.id)
            .returning('*');

        newPayload.stripePayment = stripePayment;
        newPayload.payment = updatedPayment;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', `Error when confirming Stripe payment: ${error.message}`, payload);
        throw Error(error.message);
    }
}

module.exports = exports = confirmStripePayment;
