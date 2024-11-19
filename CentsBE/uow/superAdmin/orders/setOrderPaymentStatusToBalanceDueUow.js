/**
 * Update the paymentStatus of the given orderableType
 *
 * @param {Object} payload
 */
async function setOrderPaymentStatusToBalanceDue(payload) {
    try {
        const newPayload = payload;
        const { transaction, order, updatedPayment } = payload;
        const { orderableId } = order;
        const modelToUse = order.getOrderableModelClass();

        const orderModel = await modelToUse.query(transaction).findById(orderableId);
        const previousBalanceDue = Number(orderModel.balanceDue);
        const newBalanceDue = Number(previousBalanceDue + updatedPayment.totalAmount);

        await modelToUse
            .query(transaction)
            .patch({
                paymentStatus: 'BALANCE_DUE',
                balanceDue: newBalanceDue,
            })
            .findById(orderableId)
            .returning('*');

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = setOrderPaymentStatusToBalanceDue;
