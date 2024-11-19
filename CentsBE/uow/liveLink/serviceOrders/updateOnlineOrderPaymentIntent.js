const getPendingPayment = require('../../../services/orders/queries/getPendingPaymentIntent');
const updateStripePaymentIntent = require('../../ResidentialOrder/payment/updatePaymentIntent');

const Order = require('../../../models/orders');
const Payment = require('../../../models/payment');

/**
 * Update the pending Stripe PaymentIntent based on re-calculated order totals
 *
 * @param {Object} payload
 */
async function updateOnlineOrderPaymentIntent(payload) {
    const { serviceOrder, balanceDue, transaction } = payload;

    if (serviceOrder.orderType !== 'ONLINE') {
        return payload;
    }

    const order = await Order.query(transaction).findOne({
        orderableType: 'ServiceOrder',
        orderableId: serviceOrder.id,
    });
    const paymentIntent = await getPendingPayment(order.id, transaction);
    if (!paymentIntent) {
        return payload;
    }

    // assuming the payment intent is now updated to previous order total amount.
    const updatedPaymentIntent = await updateStripePaymentIntent({
        existingIntent: paymentIntent,
        amount: balanceDue < 0.5 ? 0.5 : balanceDue,
    });

    await Payment.query(transaction)
        .patch({
            totalAmount: Number((updatedPaymentIntent.amount / 100).toFixed(2)),
            transactionFee: Number((updatedPaymentIntent.application_fee_amount / 100).toFixed(2)),
            appliedAmount: Number((updatedPaymentIntent.amount / 100).toFixed(2)),
        })
        .findById(paymentIntent.id);

    return payload;
}
module.exports = exports = updateOnlineOrderPaymentIntent;
