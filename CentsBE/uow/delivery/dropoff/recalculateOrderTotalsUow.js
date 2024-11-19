const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Extract the lineItemDetails from each ServiceOrderItem
 *
 * @param {Array} orderItems
 */
async function extractLineItems(orderItems) {
    const lineItemsArray = [];

    for (const item of orderItems) {
        const { lineItemDetail } = item.referenceItems[0];

        if (!lineItemDetail.deletedAt) {
            lineItemsArray.push(lineItemDetail);
        }
    }

    return lineItemsArray;
}

/**
 * Sum the total of each line item in the array
 *
 * @param {Array} prices
 */
async function getSumTotal(prices) {
    const totalPrice = prices.reduce((previous, currentItem) => previous + currentItem, 0);

    return totalPrice.toFixed(2);
}

/**
 * Recalculate the balanceDue, orderTotal, and netOrderTotal of the order.
 *
 * 1) Add up the lineItemTotalCost of each line item in the order to get orderTotal;
 * 2) We subtract promotion amounts, and add tip and tax, to get netOrderTotal;
 * 3) We reset the balanceDue based on a successful payment;
 *
 * @param {Object} payload
 */
async function recalculateOrderTotals(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const serviceOrder = await ServiceOrder.query(transaction)
            .withGraphFetched('[orderItems.[referenceItems.[lineItemDetail]]]')
            .findById(newPayload.serviceOrder.id);

        const {
            orderItems,
            tipAmount,
            creditAmount,
            promotionAmount,
            convenienceFee,
            pickupDeliveryFee,
            pickupDeliveryTip,
            returnDeliveryFee,
            returnDeliveryTip,
            taxAmountInCents = 0,
        } = serviceOrder;
        const lineItems = await extractLineItems(orderItems);

        let prices = lineItems.map((item) => item.lineItemTotalCost);

        prices = await Promise.all(prices);

        const orderTotal = await getSumTotal(prices);
        const netOrderTotal = Number(
            (
                orderTotal -
                promotionAmount +
                (convenienceFee || 0) -
                creditAmount +
                tipAmount +
                pickupDeliveryFee +
                pickupDeliveryTip +
                returnDeliveryFee +
                returnDeliveryTip +
                taxAmountInCents / 100
            ).toFixed(2),
        );

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                orderTotal,
                netOrderTotal,
            })
            .findById(newPayload.serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = recalculateOrderTotals;
