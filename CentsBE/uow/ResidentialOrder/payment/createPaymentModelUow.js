const Payment = require('../../../models/payment');

/**
 * Create a Payment model based on the Stripe PaymentIntent
 *
 * @param {Object} payload
 */
async function createStripePaymentIntent(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const paymentModel = await Payment.query(transaction).insert({
            orderId: newPayload.order.id,
            storeCustomerId: newPayload.storeCustomer.id,
            storeId: newPayload.store.id,
            status: newPayload.stripePaymentIntent.status,
            totalAmount: Number(newPayload.stripePaymentIntent.amount / 100),
            transactionFee: Number(newPayload.stripePaymentIntent.application_fee_amount / 100),
            tax: 0,
            paymentToken: newPayload.stripePaymentIntent.id,
            stripeClientSecret: newPayload.stripePaymentIntent.client_secret,
            currency: 'usd',
            destinationAccount: newPayload.business.merchantId,
            paymentProcessor: 'stripe',
            appliedAmount: Number(newPayload.stripePaymentIntent.amount / 100),
            unappliedAmount: 0,
        });

        newPayload.paymentModel = paymentModel;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripePaymentIntent;
