const ServiceOrder = require('../../../models/serviceOrders');
const orderCalculations = require('../../order/serviceOrder/orderCalculations');
// const { getConvenienceFeeId } = require('../../../services/orders/queries/getConvenienceFeeId');

const adjustServiceOrderCalculationsUow = async (payload) => {
    try {
        const { serviceOrderId, serviceOrder, transaction, storeDetails, store } = payload;
        const oldNetOrderTotal = serviceOrder.netOrderTotal;
        // const convenienceFeeId = await getConvenienceFeeId(serviceOrder.storeId);
        const updateServiceOrder = {};
        const orderCalculationEntities = {
            promotionAmount: serviceOrder.promotionAmount,
            taxAmountInCents: serviceOrder.taxAmountInCents,
            convenienceFeeId: serviceOrder.convenienceFeeId,
            store: store || {
                businessId: storeDetails.businessId,
            },
            orderItemsTotal: serviceOrder.orderTotal,
            transaction,
            orderId: serviceOrder.masterOrderId || payload.masterOrderId,
            serviceOrder,
            creditAmount: serviceOrder.creditAmount,
            tipAmount:
                typeof serviceOrder.tipOption === 'string' && serviceOrder.tipOption.includes('%')
                    ? serviceOrder.tipOption
                    : serviceOrder.tipAmount,
            pickupDeliveryFee: serviceOrder.pickupDeliveryFee,
            pickupDeliveryTip: serviceOrder.pickupDeliveryTip,
            returnDeliveryFee: serviceOrder.returnDeliveryFee,
            returnDeliveryTip: serviceOrder.returnDeliveryTip,
            recurringDiscount:
                payload.recurringDiscount ||
                Number(((serviceOrder.recurringDiscountInCents || 0) / 100).toFixed(2)),
        };

        const updatedOrderEntities = await orderCalculations(orderCalculationEntities);

        // total cost and balance due
        updateServiceOrder.netOrderTotal = updatedOrderEntities.netOrderTotal;
        updateServiceOrder.balanceDue =
            updatedOrderEntities.balanceDue < 0 ? 0 : updatedOrderEntities.balanceDue;
        updateServiceOrder.convenienceFee = updatedOrderEntities.convenienceFee;
        updateServiceOrder.orderTotal = updatedOrderEntities.orderTotal;
        updateServiceOrder.creditAmount = updatedOrderEntities.creditAmount;

        // pickupPayload cost
        updateServiceOrder.pickupDeliveryFee = updatedOrderEntities.pickupDeliveryFee;
        updateServiceOrder.pickupDeliveryTip = updatedOrderEntities.pickupDeliveryTip;

        // returnPayload cost
        updateServiceOrder.returnDeliveryFee = updatedOrderEntities.returnDeliveryFee;
        updateServiceOrder.returnDeliveryTip = updatedOrderEntities.returnDeliveryTip;

        // recurring discount
        updateServiceOrder.recurringDiscountInCents = updatedOrderEntities.recurringDiscountInCents;
        await ServiceOrder.query(transaction).findById(serviceOrderId).patch(updateServiceOrder);

        const newPayload = payload;
        newPayload.oldNetOrderTotal = oldNetOrderTotal;
        newPayload.serviceOrder.netOrderTotal = updateServiceOrder.netOrderTotal;
        newPayload.serviceOrder.balanceDue = updateServiceOrder.balanceDue;
        newPayload.balanceDue = updateServiceOrder.balanceDue;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = adjustServiceOrderCalculationsUow;
