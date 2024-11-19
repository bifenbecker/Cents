require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');

const Order = require('../../../models/orders');
const Payment = require('../../../models/payment');

/**
 * Cancel a pending Stripe PaymentIntent created during delivery scheduling
 *
 * Here are the scenarios:
 *
 * 1) If the ServiceOrder has orderType of ONLINE, then we subtract the delivery fee
 *    and update the Stripe PaymentIntent
 *
 * 2) If the ServiceOrder does not have orderType of ONLINE, then we just cancel the
 *    Stripe PaymentIntent since the PaymentIntent only includes the delivery fee
 *
 * In the event that the new amount of the Stripe PaymentIntent is less than $0.50,
 * we should just update the Stripe PaymentIntent to $0.50
 *
 * @param {Object} payload
 */
async function cancelStripePaymentIntent(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDelivery, serviceOrder } = newPayload;

        const order = await Order.query(transaction).findById(orderDelivery.orderId);
        newPayload.order = order;

        const payment = await Payment.query(transaction)
            .where({
                orderId: newPayload.orderDelivery.orderId,
                status: 'requires_confirmation',
            })
            .first();

        if (!payment) {
            return newPayload;
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentToken);

        if (serviceOrder.paymentTiming === 'PRE-PAY' || orderDelivery.type === 'PICKUP') {
            const cancelledIntent = await stripe.paymentIntents.cancel(payment.paymentToken);
            await Payment.query(transaction)
                .patch({ status: cancelledIntent.status })
                .findById(payment.id)
                .returning('*');
            return newPayload;
        }

        const amountToRemove = Number(
            serviceOrder.returnDeliveryFee + serviceOrder.returnDeliveryTip,
        ).toFixed(2);
        const formattedAmountToRemove = Number(amountToRemove * 100).toFixed(2);
        const finalAmountToRemove = Number(formattedAmountToRemove);
        const updatedAmount = paymentIntent.amount - finalAmountToRemove;
        const updatedFinalAmount = updatedAmount > 50 ? updatedAmount : 50;

        if (paymentIntent.status === 'succeeded') {
            return newPayload;
        }

        const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntent.id, {
            amount: updatedFinalAmount,
            application_fee_amount: Math.round(Number(updatedFinalAmount * 0.04)),
        });

        const updatedPayment = await Payment.query(transaction)
            .patch({
                status: updatedPaymentIntent.status,
                totalAmount: Number(updatedPaymentIntent.amount / 100).toFixed(2),
                appliedAmount: Number(updatedPaymentIntent.amount / 100).toFixed(2),
                transactionFee: Number(updatedPaymentIntent.application_fee_amount / 100).toFixed(
                    2,
                ),
            })
            .findById(payment.id)
            .returning('*');

        newPayload.payment = updatedPayment;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelStripePaymentIntent;
