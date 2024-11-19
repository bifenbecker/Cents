require('dotenv').config();

const stripe = require('../../stripe/stripeWithSecret');

const Payment = require('../../models/payment');
const StripeErrorHandler = require('../delivery/dropoff/StripeErrorHandler');

/**
 * Capture a pending Stripe PaymentIntent
 *
 * Here, we need to perform the following:
 *
 * 1) validate that there is a pending payment to be captured;
 * 2) get the proper PaymentIntent from Stripe;
 * 3) capture the PaymentIntent
 *
 * newPayload requirements:
 *
 * 1) pendingPayment object
 * 2) serviceOrder object
 *
 * @param {Object} payload
 */
async function capturePendingPayment(payload) {
    const newPayload = payload;
    try {
        const { transaction, pendingPayment, serviceOrder } = newPayload;
        const { netOrderTotal } = serviceOrder;

        if (!pendingPayment) return newPayload;

        let paymentIntent = await stripe.paymentIntents.retrieve(pendingPayment.paymentToken);
        const formattedNetOrderTotal = Number(netOrderTotal).toFixed(2);

        if (paymentIntent.status === 'succeeded') {
            const updatedPayment = await Payment.query()
                .patch({
                    status: 'succeeded',
                })
                .findById(pendingPayment.id)
                .returning('*');
            newPayload.payment = updatedPayment;
            return newPayload;
        }

        if (Number(formattedNetOrderTotal) < 0.5) {
            const updatedPayment = await Payment.query(transaction)
                .patch({
                    totalAmount: formattedNetOrderTotal,
                    appliedAmount: 0,
                    unappliedAmount: formattedNetOrderTotal,
                    status: 'succeeded',
                })
                .findById(pendingPayment.id)
                .returning('*');

            newPayload.payment = updatedPayment;
            return newPayload;
        }

        if (paymentIntent.status === 'requires_confirmation') {
            paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
        }
        // check for status requires capture when canceling the pending payment
        if (paymentIntent.status === 'requires_capture') {
            const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntent.id, {
                amount_to_capture: Number(paymentIntent.amount),
            });

            const updatedPayment = await Payment.query(transaction)
                .patch({
                    status: capturedPaymentIntent.status,
                    totalAmount: Number(capturedPaymentIntent.amount / 100).toFixed(2),
                    appliedAmount: Number(capturedPaymentIntent.amount / 100).toFixed(2),
                    unappliedAmount: 0,
                    transactionFee: Number(
                        capturedPaymentIntent.application_fee_amount / 100,
                    ).toFixed(2),
                })
                .findById(pendingPayment.id)
                .returning('*');

            newPayload.capturedPaymentIntent = capturedPaymentIntent;
            newPayload.payment = updatedPayment;
            newPayload.pendingPayment = null;
            newPayload.capturedPaymentIntent = capturedPaymentIntent;
        }

        return newPayload;
    } catch (error) {
        const handleStripeErrors = new StripeErrorHandler(error, newPayload.pendingPayment.id);
        if (handleStripeErrors.isStripeError()) {
            await handleStripeErrors.updatePaymentErrorStatus(newPayload.transaction);
            newPayload.isPaymentFailed = true;
        }
        throw error;
    }
}

module.exports = exports = capturePendingPayment;
