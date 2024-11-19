const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const Payment = require('../../../models/payment');

/**
 * Format the incoming payload into an insertable payload for the Payment model
 *
 * @param {Object} payload
 */
async function createPayment(payload) {
    try {
        const newPayload = { ...payload };
        const { paymentBody, transaction } = newPayload;

        const payment = await Payment.query(transaction).insert(paymentBody).returning('*');

        newPayload.payment = payment;

        return newPayload;
    } catch (error) {
        LoggerHandler('error', 'error inside createPayment', error);
        throw Error(error);
    }
}

module.exports = exports = createPayment;
