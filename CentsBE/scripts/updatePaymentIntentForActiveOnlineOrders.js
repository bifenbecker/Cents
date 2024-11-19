require('dotenv').config();
const ServiceOrder = require('../models/serviceOrders');
const Payment = require('../models/payment');
const getPendingPayment = require('../services/orders/queries/getPendingPaymentIntent');
const updateStripePaymentIntent = require('../uow/ResidentialOrder/payment/updatePaymentIntent');

(async function updatePaymentIntentForActiveOnlineOrders() {
    const activeOnlineOrders = await ServiceOrder.query()
        .withGraphJoined('order.payments')
        .where('serviceOrders.orderType', 'ONLINE')
        .where('order:payments.status', 'requires_confirmation')
        .whereNotIn('serviceOrders.status', ['COMPLETED', 'CANCELLED'])
        .whereBetween('serviceOrders.updatedAt', ['2021-09-20', '2021-09-23']);
    if (activeOnlineOrders.length) {
        activeOnlineOrders.forEach(async (activeOnlineOrder) => {
            const paymentIntent = await getPendingPayment(activeOnlineOrder.order.id);
            if (paymentIntent) {
                // assuming the payment intent is now updated to previous order total amount.
                const updatedPaymentIntent = await updateStripePaymentIntent({
                    existingIntent: paymentIntent,
                    amount:
                        activeOnlineOrder.netOrderTotal < 0.5
                            ? 0.5
                            : activeOnlineOrder.netOrderTotal,
                });

                await Payment.query()
                    .patch({
                        totalAmount: Number((updatedPaymentIntent.amount / 100).toFixed(2)),
                        transactionFee: Number(
                            (updatedPaymentIntent.application_fee_amount / 100).toFixed(2),
                        ),
                        appliedAmount: Number((updatedPaymentIntent.amount / 100).toFixed(2)),
                    })
                    .findById(paymentIntent.id);
            }
        });
    }
})();
