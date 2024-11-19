// Model
const Payment = require('../../../models/payment');

// Helpers
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Fetch a given Payment object using the Stripe PaymentIntent
 *
 * @param {Object} payload
 */
async function retrievePaymentForStripePaymentIntent(payload) {
    try {
        const newPayload = payload;
        const { paymentIntentId, transaction } = newPayload;
        const payment = await Payment.query(transaction).withGraphFetched('orders').findOne({
            paymentToken: paymentIntentId,
            paymentProcessor: 'stripe',
        });
        newPayload.payment = payment;
        newPayload.order = payment?.orders;
        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside retrievePaymentForStripePayload', error);
        throw Error(error.message);
    }
}

module.exports = exports = retrievePaymentForStripePaymentIntent;
