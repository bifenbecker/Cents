const tipOptionFinder = require('../../../helpers/tipOptionFinder');
const { formatConvenienceFee } = require('../../../services/orders/queries/convenienceFees');
const ServiceOrderQuery = require('../../../services/queries/serviceOrder');

// function isOnlineOrder(serviceOrder) {
//     return serviceOrder && serviceOrder.orderType === 'ONLINE';
// }

async function calculateTip({
    tipAmount,
    netOrderTotalWithoutTip,
    transaction,
    pickupDeliveryFee,
    pickupDeliveryTip,
    returnDeliveryFee,
    returnDeliveryTip,
    serviceOrderId,
}) {
    if (typeof tipAmount === 'string' && tipAmount.includes('%')) {
        if (serviceOrderId) {
            let amountToCalculateTip = netOrderTotalWithoutTip;
            const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId, transaction);
            const pickup = await serviceOrderQuery.doordashPickup();
            const delivery = await serviceOrderQuery.doordashDelivery();
            if (pickup) {
                amountToCalculateTip = amountToCalculateTip - pickupDeliveryFee - pickupDeliveryTip;
            }
            if (delivery) {
                amountToCalculateTip = amountToCalculateTip - returnDeliveryFee - returnDeliveryTip;
            }
            return Number(
                Number(amountToCalculateTip * (Number(tipAmount.replace('%', '')) / 100)).toFixed(
                    2,
                ),
            );
        }
        return Number(
            Number(netOrderTotalWithoutTip * (Number(tipAmount.replace('%', '')) / 100)).toFixed(2),
        );
    }
    return Number(tipAmount);
}

async function orderCalculations(payload) {
    const {
        promotionAmount = 0,
        taxAmountInCents = 0,
        pickupDeliveryFee = 0,
        pickupDeliveryTip = 0,
        returnDeliveryFee = 0,
        returnDeliveryTip = 0,
        convenienceFee,
        store: { businessId },
        orderItemsTotal = 0,
        transaction,
        orderId,
        serviceOrder = {},
        recurringDiscount = 0,
        // currentOrderDetails,
    } = payload;
    let { balanceDue = 0, tipAmount = 0, creditAmount = 0 } = payload;
    const newPayload = payload;

    const taxAmount = Number((taxAmountInCents / 100).toFixed(2));
    let convenienceAmount = 0;
    if (convenienceFee) {
        convenienceAmount = formatConvenienceFee(convenienceFee, orderItemsTotal, promotionAmount);
    }

    const netOrderTotalWithoutTip = Number(
        (
            orderItemsTotal +
            convenienceAmount +
            taxAmount +
            pickupDeliveryFee +
            returnDeliveryFee +
            returnDeliveryTip +
            pickupDeliveryTip -
            promotionAmount -
            creditAmount -
            recurringDiscount
        ).toFixed(2),
    );

    let netOrderTotal = netOrderTotalWithoutTip;
    if (tipAmount) {
        const tip = await calculateTip({
            tipAmount,
            netOrderTotalWithoutTip,
            serviceOrderId: serviceOrder.id,
            transaction,
            pickupDeliveryFee,
            pickupDeliveryTip,
            returnDeliveryFee,
            returnDeliveryTip,
        });
        netOrderTotal = netOrderTotalWithoutTip + tip;
        if (typeof tipAmount === 'string' && tipAmount.includes('%')) {
            newPayload.tipOption = tipAmount;
        } else {
            newPayload.tipOption = await tipOptionFinder(tip, netOrderTotal, businessId);
        }
        tipAmount = tip;
    }
    // (orderTotal - promoAmount + taxAmount+ convenienceFee - creditAmount
    // + tipAmount + pickupDeliveryFee + pickupDeliveryTip + returnDeliveryFee
    // + returnDeliveryTip) = netOrderTotal

    if (netOrderTotal < 0) {
        // netOrderTotal will be less than zero when a service
        // is removed after adding a credit more than the service price
        netOrderTotal += creditAmount;
        creditAmount = 0;
    }

    let totalPaid = 0;
    if (orderId) {
        const paidAmount = serviceOrder.getTotalPaid() || 0;
        totalPaid = paidAmount.toFixed(2);
        balanceDue =
            netOrderTotal === 0 && paidAmount
                ? netOrderTotal - paidAmount
                : Number((netOrderTotal - paidAmount).toFixed(2));
    }

    newPayload.totalPaid = Number(totalPaid);
    newPayload.tipAmount = tipAmount;
    newPayload.netOrderTotal = Number(netOrderTotal.toFixed(2));
    newPayload.balanceDue = balanceDue;
    newPayload.orderTotal = orderItemsTotal;
    newPayload.creditAmount = creditAmount;
    newPayload.convenienceFee = convenienceAmount;
    newPayload.recurringDiscountInCents = Number((recurringDiscount * 100).toFixed(0));

    return newPayload;
}

module.exports = exports = orderCalculations;
