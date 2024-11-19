const Pipeline = require('../pipeline');

// Uows
const cancelDoorDashDelivery = require('../../uow/delivery/doordash/cancelDoorDashDeliveryUow');
const cancelOrderDelivery = require('../../uow/delivery/cancel/cancelOrderDeliveryUow');
const recalculateOrderTotals = require('../../uow/delivery/dropoff/recalculateOrderTotalsUow');
const revertServiceOrderDeliveryStatus = require('../../uow/delivery/cancel/revertServiceOrderDeliveryStatusUow');
const deleteDeliveryOrderActivityLog = require('../../uow/delivery/cancel/deleteDeliveryOrderActivityLogUow');
const resetDeliveryFees = require('../../uow/delivery/cancel/resetDeliveryFeesUow');
const issueRefundInStripe = require('../../uow/refunds/issueRefundInStripeUow');
const createRefundModel = require('../../uow/refunds/createRefundModelUow');
const resetBalanceDueForRefund = require('../../uow/refunds/resetBalanceDueForRefundUow');
const resetReturnMethod = require('../../uow/delivery/cancel/resetReturnMethod');

/**
 * Cancel a scheduled DoorDash delivery. The cancellation process includes the following steps:
 *
 * 1) Cancel the delivery in DoorDash - ✓
 * 2) Update the OrderDelivery status and cancellation reason - ✓
 * 3) Issue Refund in Stripe - ✓
 * 4) Save Refund model in our backend - ✓
 * 5) Delete the ServiceOrderItem for the delivery if applicable - ✓
 * 6) Delete the ServiceReferenceItem for the delivery if applicable - ✓
 * 7) Delete the ServiceReferenceItemDetail for the delivery if applicable - ✓
 * 8) Reset delivery fees on the ServiceOrder model - ✓
 * 9) Update the ServiceOrder order totals - ✓
 * 10) Update the ServiceOrder status to READY_FOR_PICKUP - ✓
 * 11) Delete the OrderActivityLog entry for READY_FOR_DRIVER_PICKUP - ✓
 *
 * Required values in payload:
 *
 * 1) serviceOrder;
 * 2) orderDeliveryId;
 * 3) cancellationReason;
 *
 * @param {Object} payload
 * @returns {Object} output
 */
async function cancelDoorDashDeliveryPipeline(payload) {
    try {
        const doorDashDeliveryPipeline = new Pipeline([
            resetReturnMethod,
            cancelDoorDashDelivery,
            cancelOrderDelivery,
            issueRefundInStripe,
            createRefundModel,
            resetBalanceDueForRefund,
            resetDeliveryFees,
            recalculateOrderTotals,
            revertServiceOrderDeliveryStatus,
            deleteDeliveryOrderActivityLog,
        ]);
        const output = await doorDashDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelDoorDashDeliveryPipeline;
