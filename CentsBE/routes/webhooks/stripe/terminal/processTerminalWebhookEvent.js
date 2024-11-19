const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

// UoW and Pipeline
const processStripeTerminalWebhookEvent = require('../../../../pipeline/stripe/terminal/processStripeTerminalWebhookPipeline');
const validateStripeTerminalWebhookRequest = require('../../../../uow/stripe/terminal/validateStripeTerminalWebhookRequestUow');

// Services
const eventEmitter = require('../../../../config/eventEmitter');

/**
 * Process the succeeded and failed Terminal webhook events
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function processTerminalWebhookEvent(req, res, next) {
    try {
        const { event } = req.constants;

        const validationObject = await validateStripeTerminalWebhookRequest({ event });

        if (!!validationObject?.error) {
            LoggerHandler(
                'error',
                `Validation error in processing Stripe Terminal Webhook event`,
                validationObject,
            );
            eventEmitter.emit('terminal-payment-failed', {
                storeId: validationObject?.store?.id,
                payload: {
                    error: validationObject?.message,
                },
            });
            return res.json({
                success: true,
            });
        }

        const payload = {
            event,
            paymentIntentId: event?.data?.object?.action?.process_payment_intent?.payment_intent,
            webhookType: event?.type,
            store: validationObject?.store,
        };

        await processStripeTerminalWebhookEvent(payload);
        return res.json({
            success: true,
            object: event?.data?.object,
        });
    } catch (error) {
        LoggerHandler('error', `Error in processing Stripe Terminal webhook event`, error);
        return res.json({
            success: true,
        });
    }
}

module.exports = exports = processTerminalWebhookEvent;
