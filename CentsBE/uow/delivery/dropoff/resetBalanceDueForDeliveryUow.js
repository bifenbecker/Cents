const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Reset the balanceDue based on the delivery payment
 *
 * NOTE: we're deducting the payment total from the balanceDue here even though
 * the payment has not yet been captured. We will need to absolutely make sure we capture
 * the payment in Stripe when the delivery is completed before we mark the order as complete,
 * as well as add validation around order completion to ensure that the payments underneath the
 * order are all successful.
 *
 * Also: since we're setting balanceDue as 0 for online orders,
 * the finalBalanceDue should be moved back to 0,
 * since we've added this to the pending payment.
 * If not, then finalBalanceDue should be the updatedBalanceDue calculation.
 *
 * @param {Object} payload
 */
async function resetBalanceDue(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder, paymentModel } = newPayload;

        if (serviceOrder.balanceDue === 0 || (paymentModel && paymentModel.status !== 'succeeded'))
            return newPayload;

        const balanceToRemove = paymentModel ? paymentModel.totalAmount : serviceOrder.balanceDue;
        const updatedBalanceDue = Number(serviceOrder.balanceDue - balanceToRemove);
        const finalBalanceDue = updatedBalanceDue;

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                balanceDue: finalBalanceDue,
                paymentStatus:
                    finalBalanceDue === 0 ? 'PAID' : newPayload.serviceOrder.paymentStatus,
            })
            .findById(newPayload.serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = resetBalanceDue;
