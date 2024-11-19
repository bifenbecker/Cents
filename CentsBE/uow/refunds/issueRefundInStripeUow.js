const stripe = require('../../routes/stripe/config');

const Order = require('../../models/orders');
const Payment = require('../../models/payment');

/**
 * Find the appropriate payment to refund and issue refund in Stripe for that payment
 *
 * The payment we are refunding is the latest successful payment made on the order.
 *
 * If there either isn't a successful payment on file or the return delivery was free,
 * we will not be issuing a refund in Stripe
 *
 * @param {Object} payload
 */
async function issueRefundInStripe(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDelivery } = newPayload;

        const order = await Order.query(transaction).findById(orderDelivery.orderId);
        newPayload.order = order;

        const paymentToRefund = await Payment.query(transaction)
            .where({
                orderId: order.id,
                status: 'succeeded',
                paymentProcessor: 'stripe',
            })
            .first()
            .orderBy('createdAt', 'desc');

        if (
            !paymentToRefund ||
            Number(orderDelivery.totalDeliveryCost + orderDelivery.courierTip) === 0
        ) {
            return newPayload;
        }

        const stripeRefund = await stripe.refunds.create({
            payment_intent: paymentToRefund.paymentToken,
            reverse_transfer: true,
            reason: 'requested_by_customer',
        });

        newPayload.refundedPayment = paymentToRefund;
        newPayload.stripeRefund = stripeRefund;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = issueRefundInStripe;
