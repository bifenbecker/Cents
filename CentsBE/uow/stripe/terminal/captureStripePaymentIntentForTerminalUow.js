const stripe = require('../../../stripe/stripeWithSecret');
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Capture the Stripe PaumentIntent if the webhook type is terminal.reader.action_succeeded
 *
 * @param {Object} payload
 */
async function captureStripePaymentIntentForTerminal(payload) {
    try {
        const newPayload = payload;
        const { paymentIntentId, webhookType } = newPayload;

        if (webhookType !== STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED) {
            return newPayload;
        }

        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
        newPayload.paymentIntent = paymentIntent;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside captureStripePaymentIntentForTerminal', error);
        throw Error(error.message);
    }
}

module.exports = exports = captureStripePaymentIntentForTerminal;
