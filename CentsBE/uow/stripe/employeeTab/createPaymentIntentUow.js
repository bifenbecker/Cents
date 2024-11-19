const stripe = require('../../../stripe/stripeWithSecret');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Create the Stripe PaymentIntent
 *
 * @param {Object} payload
 */
async function createPaymentIntent(payload) {
    try {
        const newPayload = { ...payload };
        const { body } = newPayload;

        const paymentIntent = await stripe.paymentIntents.create(body);
        newPayload.paymentIntent = paymentIntent;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside createPaymentIntent', error);
        throw Error(error);
    }
}

module.exports = exports = createPaymentIntent;
