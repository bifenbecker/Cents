const Refund = require('../../models/refund');
const Payment = require('../../models/payment');

/**
 * Create a Refund model object in our database using the refund created in Stripe
 * and reset the Payment model status to mark as "refunded"
 *
 * @param {Object} payload
 */
async function createRefundModel(payload) {
    try {
        const newPayload = payload;
        const { transaction, refundedPayment, stripeRefund, order } = payload;

        if (!refundedPayment || !stripeRefund) {
            return newPayload;
        }

        const refund = await Refund.query(transaction).insert({
            orderId: order.id,
            paymentId: refundedPayment.id,
            refundAmountInCents: stripeRefund.amount,
            thirdPartyRefundId: stripeRefund.id,
            refundProvider: 'stripe',
            status: stripeRefund.status,
            reason: 'REQUESTED_BY_CUSTOMER',
        });

        if (refund.status === 'succeeded') {
            const updatedRefundedPayment = await Payment.query(transaction)
                .patch({
                    status: 'refunded',
                })
                .findById(refundedPayment.id)
                .returning('*');

            newPayload.refundedPayment = updatedRefundedPayment;
        }

        newPayload.refund = refund;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createRefundModel;
