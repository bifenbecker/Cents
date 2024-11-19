const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Update the balanceDue, status, and paymentStatus of the ServiceOrder
 *
 * @param {Object} payload
 */
async function updateServiceOrderForPayment(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const updatedBalanceDue = Number(
            newPayload.serviceOrder.balanceDue - newPayload.paymentModel.totalAmount,
        );
        // const updatedStatus = (
        //     newPayload.serviceOrder.status === 'PAYMENT_REQUIRED' &&
        //     newPayload.payment.status === 'succeeded'
        // )

        const serviceOrder = await ServiceOrder.query(transaction)
            .patch({
                balanceDue: updatedBalanceDue,
                paymentStatus: updatedBalanceDue > 0 ? 'BALANCE_DUE' : 'PAID',
            })
            .findById(newPayload.serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = serviceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderForPayment;
