const Payment = require('../../../models/payment');

/**
 * Create a Payment model that corresponds to the pre-auth in pickup delivery orders
 *
 * newPayload must contain:
 *
 * 1) order - the Order model (i.e., the order must be created first)
 * 2) storeCustomer - the StoreCustomer model representing the customer
 * 3) store - the Store model
 * 4) business - the Business model
 *
 * @param {Object} payload
 */
async function createPayment(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const pickupPayment = await Payment.query(transaction).insert({
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

        newPayload.paymentModel = pickupPayment;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createPayment;
