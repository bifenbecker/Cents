const Payment = require('../../../models/payment');

/**
 * Create a Refund model object in our database for the cash payment
 *
 * @param {Object} payload
 */
async function updatePaymentStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, payment, paymentStatus } = payload;

        const updatedPayment = await Payment.query(transaction)
            .patch({
                status: paymentStatus,
            })
            .findById(payment.id)
            .returning('*');

        newPayload.updatedPayment = updatedPayment;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updatePaymentStatus;
