const ServiceOrder = require('../../models/serviceOrders');

/**
 * Based on how much we refunded the customer, determine whether the refund amount
 * remove any delivery fee related to the refund and then update the balance due accordingly
 *
 * Balance due calculation:
 *
 * 1) get the amount that was refunded
 * 2) determine the return delivery fees (including tip)
 *    a) if refund amount = return delivery fees, balance due remains at 0;
 *    b) if refund amount is greater than return delivery fees, balance due should
 *       equal (refund amount - return delivery fees)
 *
 *
 * @param {Object} payload
 */
async function resetBalanceDueForRefund(payload) {
    try {
        const newPayload = payload;
        const { transaction, stripeRefund, order } = newPayload;
        let refundedAmount = 0;

        let serviceOrder = await ServiceOrder.query(transaction).findById(order.orderableId);
        const currentBalanceDue = serviceOrder.balanceDue;

        if (stripeRefund) {
            refundedAmount = Number(stripeRefund.amount / 100).toFixed(2);
        }

        const returnDeliveryFees = Number(
            serviceOrder.returnDeliveryFee + serviceOrder.returnDeliveryTip,
        );
        const balanceDueToAdd = Number(refundedAmount - returnDeliveryFees);

        serviceOrder = await ServiceOrder.query(transaction)
            .patch({
                balanceDue: Number(currentBalanceDue + balanceDueToAdd),
                paymentStatus:
                    Number(currentBalanceDue + balanceDueToAdd) > 0 ? 'BALANCE_DUE' : 'PAID',
            })
            .findById(order.orderableId)
            .returning('*');

        newPayload.serviceOrder = serviceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = resetBalanceDueForRefund;
