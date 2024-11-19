const Payment = require('../../../models/payment');

/**
 * Determine whether to create a new payment or update an existing one
 *
 * @param {Object} payload
 */
async function determinePaymentAction(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const pendingPayment = await Payment.query(transaction)
            .where({
                status: 'requires_confirmation',
                orderId: newPayload.order.id,
            })
            .first();

        if (pendingPayment) {
            newPayload.pendingPayment = pendingPayment;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = determinePaymentAction;
