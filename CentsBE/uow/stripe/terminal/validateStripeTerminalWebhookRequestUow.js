// Models
const Payment = require('../../../models/payment');
const Store = require('../../../models/store');

// Config and Functions
const stripe = require('../../../stripe/stripeWithSecret');
const { STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES } = require('../../../constants/constants');

/**
 * Use incoming payload to validate whether the Stripe PaymentIntent
 * is available and ready to be captured
 *
 * @param {Object} payload
 */
async function validateStripeTerminalWebhookRequest(payload) {
    try {
        const { event, transaction } = payload;

        if (!event) {
            return {
                message: 'Stripe Terminal webhook event data is missing',
                error: true,
            };
        }

        const { data, type } = event;
        const store = await Store.query().findOne({ stripeLocationId: data?.object?.location });

        if (type === STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_FAILED) {
            return {
                message: data?.object?.action?.failure_message,
                error: true,
                store,
            };
        }

        if (type !== STRIPE_TERMINAL_WEBHOOK_EVENT_TYPES.ACTION_SUCCEEDED) {
            return {
                message: 'Incoming Stripe Terminal webhook event type is not defined.',
                error: true,
                store,
            };
        }

        const { object } = data;

        if (object?.action?.status !== 'succeeded') {
            return {
                message: 'Payment capturing on the terminal failed',
                error: true,
                store,
            };
        }

        if (!object?.action?.process_payment_intent?.payment_intent) {
            return {
                message: 'Payment Intent is not in the incoming request',
                error: true,
                store,
            };
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
            object?.action?.process_payment_intent?.payment_intent,
        );

        if (paymentIntent.status !== 'requires_capture') {
            return {
                message: `Payment Intent status for the Terminal is ${paymentIntent.status} and is thus not ready to be captured.`,
                error: true,
                store,
            };
        }

        const foundPayment = await Payment.query(transaction).findOne({
            paymentToken: object?.action?.process_payment_intent?.payment_intent,
            paymentProcessor: 'stripe',
        });

        if (!foundPayment) {
            return {
                message: 'No payment object is associated with the incoming PaymentIntent',
                error: true,
                store,
            };
        }

        return {
            error: false,
            message: null,
            store,
        };
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = validateStripeTerminalWebhookRequest;
