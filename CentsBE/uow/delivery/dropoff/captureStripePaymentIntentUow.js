require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');
const logger = require('../../../lib/logger');
const StripeErrorHandler = require('./StripeErrorHandler');

/**
 * Capture a Stripe PaymentIntent for the payment created for delivery.
 *
 * Here, we need to perform the following:
 *
 * 1) get the proper PaymentIntent from Stripe;
 * 2) update the current PaymentIntent for the correct amount based on final delivery fee
 * 3) capture the updated PaymentIntent
 *
 * The fields that we must receive from a previous Uow:
 *
 * 1) paymentModel
 * 2) stripePaymentIntent
 *
 * @param {Object} payload
 */
async function captureStripePaymentIntent(payload) {
    const newPayload = payload;

    try {
        const { paymentModel } = newPayload;
        let { stripePaymentIntent } = newPayload;

        if (!paymentModel || newPayload.orderDelivery.type === 'PICKUP') {
            return newPayload;
        }

        if (paymentModel.status === 'succeeded') {
            return newPayload;
        }

        if (stripePaymentIntent.status === 'requires_confirmation') {
            stripePaymentIntent = await stripe.paymentIntents.confirm(stripePaymentIntent.id);
        }
        if (stripePaymentIntent.status === 'requires_capture') {
            const capturedPaymentIntent = await stripe.paymentIntents.capture(
                stripePaymentIntent.id,
            );
            newPayload.capturedPaymentIntent = capturedPaymentIntent;
        } else {
            newPayload.isPaymentFailed = true;
        }

        return newPayload;
    } catch (error) {
        logger.error(error);
        const { transaction, paymentModel } = newPayload;
        if (payload.isDeliveryOrder) {
            const handleStripeErrors = new StripeErrorHandler(error, paymentModel.id);
            if (handleStripeErrors.isStripeError()) {
                newPayload.isPaymentFailed = true;
                await handleStripeErrors.updatePaymentErrorStatus(transaction);
                return newPayload;
            }
        }

        throw Error(error.message);
    }
}

module.exports = exports = captureStripePaymentIntent;
