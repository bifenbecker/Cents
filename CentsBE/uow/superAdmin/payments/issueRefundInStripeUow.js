const stripe = require('../../../routes/stripe/config');

/**
 * Use the incoming payment object to properly issue a refund in Stripe.
 *
 * @param {Object} payload
 */
async function issueRefundInStripe(payload) {
    try {
        const newPayload = payload;
        const { payment } = newPayload;

        const stripeRefund = await stripe.refunds.create({
            payment_intent: payment.paymentToken,
            reverse_transfer: true,
            reason: 'requested_by_customer',
        });

        newPayload.stripeRefund = stripeRefund;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = issueRefundInStripe;
