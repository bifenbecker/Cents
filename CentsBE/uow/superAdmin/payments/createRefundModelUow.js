const Refund = require('../../../models/refund');

/**
 * Create a Refund model object in our database for the cash payment
 *
 * @param {Object} payload
 */
async function createRefundModel(payload) {
    try {
        const newPayload = payload;
        const { transaction, payment, order } = payload;
        const refundAmount = Math.round(Number(payment.totalAmount * 100));

        const refund = await Refund.query(transaction).insert({
            orderId: order.id,
            paymentId: payment.id,
            refundAmountInCents: refundAmount,
            refundProvider: payment.paymentProcessor,
            status: 'succeeded',
            reason: 'INITIATED_IN_INTERNAL_MANAGER',
        });

        newPayload.refund = refund;
        newPayload.paymentStatus = 'refunded';

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createRefundModel;
