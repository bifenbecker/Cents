require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');

const Payment = require('../../../models/payment');
const logger = require('../../../lib/logger');
const StripeErrorHandler = require('./StripeErrorHandler');

/**
 * Update a Stripe PaymentIntent for a pending payment
 *
 * Here, we need to perform the following:
 *
 * 1) get the proper PaymentIntent from Stripe;
 * 2) update the amount of the current PaymentIntent for the proper netOrderTotal
 * 3) update the current PaymentIntent with the payment method from the payload
 *
 * Skip this step if:
 *
 * 1) payload does not have a pendingPayment object; or
 * 2) if updated balanceDue is 0;
 *
 * @param {Object} payload
 */
async function updateStripePaymentIntent(payload) {
    const newPayload = payload;

    try {
        const { transaction } = newPayload;

        if (!newPayload.pendingPayment || newPayload.serviceOrder.balanceDue < 0.5) {
            return newPayload;
        }
        const orderId =
            newPayload.serviceOrder && newPayload.serviceOrder.masterOrderId
                ? newPayload.serviceOrder.masterOrderId
                : newPayload.orderDelivery.orderId;
        const payment = await Payment.query(transaction)
            .where({
                orderId,
                status: 'requires_confirmation',
            })
            .first();

        const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentToken);
        const newAmount = Number(newPayload.serviceOrder.balanceDue).toFixed(2);
        const stripeNewAmount = Number(newAmount * 100).toFixed(2);
        const finalNewAmount = Number(stripeNewAmount);

        if (paymentIntent.status !== 'requires_capture') {
            const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntent.id, {
                payment_method: newPayload.paymentToken || paymentIntent.payment_method,
                amount: finalNewAmount,
                application_fee_amount: Math.round(Number(finalNewAmount * 0.04)),
            });
            const updatedPayment = await Payment.query(transaction)
                .patch({
                    status: updatedPaymentIntent.status,
                    totalAmount: Number(updatedPaymentIntent.amount / 100).toFixed(2),
                    appliedAmount: Number(updatedPaymentIntent.amount / 100).toFixed(2),
                    transactionFee: Number(
                        updatedPaymentIntent.application_fee_amount / 100,
                    ).toFixed(2),
                })
                .findById(payment.id)
                .returning('*');
            newPayload.paymentModel = updatedPayment;
            newPayload.stripePaymentIntent = updatedPaymentIntent;
        } else {
            newPayload.paymentModel = payment;
            newPayload.stripePaymentIntent = paymentIntent;
        }

        return newPayload;
    } catch (error) {
        logger.error(error);

        if (payload.isDeliveryOrder) {
            const handleStripeErrors = new StripeErrorHandler(error);
            if (handleStripeErrors.isStripeError()) {
                newPayload.isPaymentFailed = true;
                return newPayload;
            }
        }

        throw Error(error.message);
    }
}

module.exports = exports = updateStripePaymentIntent;
