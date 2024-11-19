const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

/**
 * Determine the proper balance due of the order, based on payment status
 *
 * Here are the situations:
 *
 * 1) if payment status is succeeded but current payment status is BALANCE_DUE:
 *    - subtract the payment totalAmount from the current balanceDue
 * 2) if payment status is not succeeded and current payment status is BALANCE_DUE:
 *    - payment earlier in the pipeline here was not successful
 *    - status should still be BALANCE_DUE and balanceDue should not change.
 * 3) if payment status is succeeded and current payment status is PAID
 *    - payment is already succeeded so no action to be done
 *    - this situation should not occur as this would be flagged during request validation
 *
 * @param {Number} previousBalanceDue
 * @param {String} currentPaymentStatus
 * @param {Object} payment
 */
async function calculateBalanceDue(previousBalanceDue, currentPaymentStatus, payment) {
    const { status, totalAmount } = payment;
    let newBalanceDue = previousBalanceDue;

    if (status === 'succeeded' && currentPaymentStatus !== 'PAID') {
        newBalanceDue = Number(previousBalanceDue - totalAmount);
    }

    return newBalanceDue;
}

/**
 * Update the paymentStatus and balanceDue of the given orderableType
 *
 * @param {Object} payload
 */
async function updateOrderPaymentStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, order, payment } = payload;
        const { orderableId } = order;
        const modelToUse = order.getOrderableModelClass();

        const orderModel = await modelToUse.query(transaction).findById(orderableId);
        const previousBalanceDue = Number(orderModel.balanceDue);
        const newBalanceDue = await calculateBalanceDue(
            previousBalanceDue,
            orderModel.paymentStatus,
            payment,
        );

        await modelToUse
            .query(transaction)
            .patch({
                balanceDue: newBalanceDue,
                paymentStatus: newBalanceDue === 0 ? 'PAID' : 'BALANCE_DUE',
            })
            .findById(orderableId)
            .returning('*');

        return newPayload;
    } catch (error) {
        LoggerHandler('error', `Error in updating order payment status: ${error.message}`, payload);
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderPaymentStatus;
