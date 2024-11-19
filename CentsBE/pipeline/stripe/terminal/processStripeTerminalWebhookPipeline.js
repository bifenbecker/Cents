const Pipeline = require('../../pipeline');

// Uows
const retrievePaymentForStripePaymentIntent = require('../../../uow/stripe/terminal/retrievePaymentForStripePaymentIntentUow');
const captureStripePaymentIntentForTerminal = require('../../../uow/stripe/terminal/captureStripePaymentIntentForTerminalUow');
const updatePaymentForCapturedPaymentIntent = require('../../../uow/stripe/terminal/updatePaymentForCapturedPaymentIntentUow');
const updateOrderableForCapturedPaymentIntent = require('../../../uow/stripe/terminal/updateOrderableForCapturedPaymentIntentUow');

// EventEmitter
const eventEmitter = require('../../../config/eventEmitter');

/**
 * Run the pipeline to capture payment and update various models for a Stripe Terminal webhook event
 *
 * The pipeline contains the following units of work:
 *
 * 1) Retrieve payment from PaymentIntent;
 * 2) If webhook type is action_succeeded, capture the Stripe PaymentIntent;
 * 3) If webhook type is action_succeeded and payment intent status is succeeded,
 *    update the Payment object
 * 4) If webhook type is action_succeeded, update the ServiceOrder
 * 5) Reverse charges for failure scenarios
 * 6) If webhook type is action_failed, return the payment object
 *
 * @param {Object} payload
 */
async function processStripeTerminalWebhookPipeline(payload) {
    try {
        const stripeTerminalPipeline = new Pipeline([
            retrievePaymentForStripePaymentIntent,
            captureStripePaymentIntentForTerminal,
            updatePaymentForCapturedPaymentIntent,
            updateOrderableForCapturedPaymentIntent,
        ]);
        const output = await stripeTerminalPipeline.run(payload);

        if (output?.webhookType === 'terminal.reader.action_succeeded') {
            eventEmitter.emit('terminal-payment-succeeded', {
                storeId: output?.payment?.storeId,
                payload: {
                    payment: output?.payment,
                    paymentIntent: output?.paymentIntent,
                    orderableId: output?.order?.orderableId,
                    orderableType: output?.order?.orderableType,
                },
            });
        }

        return output;
    } catch (error) {
        eventEmitter.emit('terminal-payment-failed', {
            storeId: payload?.store?.id,
            payload: {
                error: payload?.event?.data?.object?.action?.failure_message,
            },
        });
        throw Error(error.message);
    }
}

module.exports = exports = processStripeTerminalWebhookPipeline;
