const { isEmpty } = require('lodash');
const ServiceOrder = require('../../../models/serviceOrders');
const { getConvenienceFeeId } = require('../../../services/orders/queries/getConvenienceFeeId');
const { calculateConvenienceFee } = require('../../../services/orders/queries/convenienceFees');
const applyToFixed = require('../../../utils/applyToFixed');
const { paymentStatuses } = require('../../../constants/constants');

// function findPaymentStatus(balanceDue, type) {
//     if (type === 'ONLINE') {
//         return 'PAID';
//     }
//     return balanceDue === 0 ? 'PAID' : 'BALANCE_DUE';
// }

async function updateServiceOrderTotals(payload) {
    try {
        // In case of online order
        // payment capture will happen in the end since payment intent is already created
        const { transaction, orderDelivery, serviceOrder, itemsTotal, storeId } = payload;
        const convenienceFeeId = await getConvenienceFeeId(storeId);
        let convenienceAmount = 0;
        if (convenienceFeeId) {
            convenienceAmount = await calculateConvenienceFee(
                transaction,
                convenienceFeeId,
                itemsTotal,
                0,
            );
        }
        const pickupDeliveryTip = orderDelivery.pickup
            ? Number(orderDelivery.pickup.courierTip)
            : 0;
        const pickupDeliveryFee = orderDelivery.pickup
            ? Number(orderDelivery.pickup.totalDeliveryCost)
            : 0;
        const returnDeliveryFee =
            orderDelivery.delivery && !isEmpty(orderDelivery.delivery)
                ? Number(orderDelivery.delivery.totalDeliveryCost)
                : 0;
        const returnDeliveryTip =
            orderDelivery.delivery && !isEmpty(orderDelivery.delivery)
                ? Number(orderDelivery.delivery.courierTip)
                : 0;
        const balanceDue = applyToFixed(
            Number(serviceOrder.balanceDue) +
                pickupDeliveryTip +
                pickupDeliveryFee +
                returnDeliveryFee +
                returnDeliveryTip +
                convenienceAmount +
                itemsTotal,
        );
        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                orderTotal: itemsTotal,
                netOrderTotal: balanceDue,
                convenienceFee: convenienceAmount,
                balanceDue,
                // paymentStatus: findPaymentStatus(this.balanceDue, type),
                paymentStatus:
                    balanceDue === 0 ? paymentStatuses.PAID : paymentStatuses.BALANCE_DUE,
                pickupDeliveryFee,
                pickupDeliveryTip,
                returnDeliveryFee,
                returnDeliveryTip,
                convenienceFeeId,
            })
            .findById(serviceOrder.id)
            .returning('*');
        const newPayload = payload;
        newPayload.serviceOrder = updatedServiceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = updateServiceOrderTotals;
