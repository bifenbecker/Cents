const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Format the incoming payload into an insertable payload for the Payment model
 *
 * @param {Object} payload
 */
async function formatPaymentObject(payload) {
    try {
        const newPayload = { ...payload };
        const { body, paymentIntent } = newPayload;

        const paymentBody = {
            orderId: body.metadata.orderId,
            storeId: body.metadata.storeId,
            status: paymentIntent.status,
            totalAmount: body.amount / 100,
            transactionFee: body.application_fee_amount / 100,
            paymentToken: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
            tax: 0,
            currency: body.currency,
            destinationAccount: body.on_behalf_of,
            paymentProcessor: 'stripe',
            appliedAmount: body.amount / 100,
            unappliedAmount: body.amount / 100 - body.amount / 100,
            storeCustomerId: body.metadata.storeCustomerId,
        };

        newPayload.paymentBody = paymentBody;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside formatPaymentObject', error);
        throw Error(error);
    }
}

module.exports = exports = formatPaymentObject;
