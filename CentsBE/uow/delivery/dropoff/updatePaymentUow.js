const Payment = require('../../../models/payment');

/**
 * Use incoming payload to update the existing Payment model.
 *
 * @param {Object} payload
 */
async function updatePayment(payload) {
    try {
        const newPayload = payload;
        const { transaction, capturedPaymentIntent, orderDelivery = {}, paymentModel } = newPayload;

        if (orderDelivery.type === 'PICKUP' || !paymentModel || !capturedPaymentIntent) {
            return newPayload;
        }

        const totalAmount = Number(capturedPaymentIntent.amount / 100);

        const payment = await Payment.query(transaction)
            .patch({
                totalAmount,
                status: capturedPaymentIntent.status,
            })
            .findById(paymentModel.id)
            .returning('*');

        newPayload.paymentModel = payment;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updatePayment;
