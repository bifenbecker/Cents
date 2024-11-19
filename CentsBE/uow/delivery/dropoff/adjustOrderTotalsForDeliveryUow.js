const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Adjust the balanceDue, orderTotal, and netOrderTotal of the order.
 *
 * 1) We adjust the orderTotal because the orderTotal represents the sum of all line items;
 * 2) We adjust the netOrderTotal because we have adjusted orderTotal;
 * 3) We adjust balanceDue because delivery fees have not yet been paid;
 *
 * @param {Object} payload
 */
async function adjustOrderTotalsForDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder, orderDelivery } = newPayload;

        const updatedNetOrderTotal = Number(
            Number(serviceOrder.netOrderTotal) +
                Number(orderDelivery.totalDeliveryCost) +
                Number(orderDelivery.courierTip),
        );
        const updatedBalanceDue = Number(
            Number(serviceOrder.balanceDue) +
                Number(orderDelivery.totalDeliveryCost) +
                Number(orderDelivery.courierTip),
        );

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                netOrderTotal: updatedNetOrderTotal,
                balanceDue: updatedBalanceDue,
                returnDeliveryFee: Number(orderDelivery.totalDeliveryCost),
                returnDeliveryTip: Number(orderDelivery.courierTip),
            })
            .findById(serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = adjustOrderTotalsForDelivery;
