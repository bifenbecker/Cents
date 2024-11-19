const ServiceOrder = require('../../../models/serviceOrders');
const ServiceReferenceItemDetail = require('../../../models/serviceReferenceItemDetail');
const getSingleOrderLogic = require('../../../uow/singleOrder/getSingleOrderLogicUOW');

/**
 * Filter through order items to identify the per pound service line item
 *
 * @param {Array} orderItems
 */
async function identifyPerPoundService(orderItems) {
    for (const item of orderItems) {
        const { lineItemDetail } = item.referenceItems[0];

        if (lineItemDetail.category === 'PER_POUND') return lineItemDetail;
    }

    return null;
}

/**
 * Given the updatedWeight from the request, determine the new line item total cost
 *
 * @param {Number} updatedWeight
 * @param {Object} lineItem
 */
async function calculatNewLineItemTotalCost(updatedWeight, lineItem) {
    const minWeight = lineItem.lineItemMinQuantity;
    const minPrice = lineItem.lineItemMinPrice;
    const unitCost = lineItem.lineItemUnitCost;

    if (minWeight !== null && minPrice !== null && minWeight >= updatedWeight) return minPrice;

    if (minWeight == null && minPrice == null) return Number((updatedWeight * unitCost).toFixed(2));

    const remainingWeight = updatedWeight - minWeight;
    const variablePrice = unitCost * remainingWeight;

    return Number((minPrice + variablePrice).toFixed(2));
}

/**
 * For non-per-pound-service line items, return an array containing the lineItemTotalCost
 *
 * @param {Array} orderItems
 */
async function generateOtherLineItemTotals(orderItems) {
    const lineItemTotalsArray = [];

    for (const item of orderItems) {
        const { lineItemDetail } = item.referenceItems[0];
        if (lineItemDetail.category !== 'PER_POUND') {
            lineItemTotalsArray.push(lineItemDetail.lineItemTotalCost);
        }
    }

    return Promise.all(lineItemTotalsArray);
}

/**
 * For post-pay, use the incoming weight to update the per pound service
 * line item and recalculate the order total
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateOrderTotal(req, res, next) {
    try {
        const { id } = req.params;
        const { updatedWeight } = req.body;
        let orderTotal = 0;

        const serviceOrder = await ServiceOrder.query()
            .withGraphFetched('[orderItems.[referenceItems.[lineItemDetail]]]')
            .findById(id);

        const netOrderTotalDifference = serviceOrder.orderTotal - serviceOrder.netOrderTotal;
        const perPoundServiceLineItem = await identifyPerPoundService(serviceOrder.orderItems);
        const updatedTotalCost = await calculatNewLineItemTotalCost(
            updatedWeight,
            perPoundServiceLineItem,
        );
        const lineItemTotals = await generateOtherLineItemTotals(serviceOrder.orderItems);

        lineItemTotals.push(updatedTotalCost);

        for (const value in lineItemTotals) {
            if (value) {
                orderTotal += lineItemTotals[value];
            }
        }

        await ServiceReferenceItemDetail.query()
            .patch({
                lineItemQuantity: updatedWeight,
                lineItemTotalCost: updatedTotalCost,
            })
            .findById(perPoundServiceLineItem.id)
            .returning('*');

        await ServiceOrder.query()
            .patch({
                orderTotal,
                netOrderTotal: orderTotal - netOrderTotalDifference,
            })
            .findById(id)
            .returning('*');

        const orderDetails = await getSingleOrderLogic(id, req.currentStore);
        res.status(200).json({
            success: true,
            orderDetails,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateOrderTotal;
