const Pipeline = require('../../pipeline');

// Uows
const cancelOrderDelivery = require('../../../uow/delivery/cancel/cancelOrderDeliveryUow');
const recalculateOrderTotals = require('../../../uow/delivery/dropoff/recalculateOrderTotalsUow');
const revertServiceOrderDeliveryStatus = require('../../../uow/delivery/cancel/revertServiceOrderDeliveryStatusUow');
const deleteDeliveryOrderActivityLog = require('../../../uow/delivery/cancel/deleteDeliveryOrderActivityLogUow');
const cancelRouteDeliveryUow = require('../../../uow/driverApp/cancelTheRouteDeliveryUOW');
const cancelRouteDeliveryActivityLogUow = require('../../../uow/driverApp/cancelRouteDeliveryActivityLogUOW');
const updateServiceOrderBags = require('../../../uow/driverApp/updateServiceorderBagsUOW');
const markNextDeliveryOrderAsInProgressUOW = require('../../../uow/driverApp/completePickupOrder/markNextOrderAsInProgressUOW');
const resetDeliveryFees = require('../../../uow/delivery/cancel/resetDeliveryFeesUow');
const issueRefundInStripe = require('../../../uow/refunds/issueRefundInStripeUow');
const createRefundModel = require('../../../uow/refunds/createRefundModelUow');
const resetBalanceDueForRefund = require('../../../uow/refunds/resetBalanceDueForRefundUow');
const resetReturnMethod = require('../../../uow/delivery/cancel/resetReturnMethod');

/**
 * Cancel a scheduled Uber delivery. The cancellation process includes the following steps:
 *
 * 1) Authenticate with Uber - ✓
 * 2) Cancel the delivery in Uber - ✓
 * 3) Update the OrderDelivery status and cancellation reason - ✓
 * 4) Delete the ServiceOrderItem for the delivery - ✓
 * 5) Delete the ServiceReferenceItem for the delivery - ✓
 * 6) Delete the ServiceReferenceItemDetail for the delivery - ✓
 * 7) Update the ServiceOrder order totals - ✓
 * 8) Update the ServiceOrder status to READY_FOR_PICKUP - ✓
 * 9) Delete the OrderActivityLog entry for READY_FOR_DRIVER_PICKUP - ✓
 * 10) Cancel or update the Stripe PaymentIntent - ✓
 * 11) Update the Payment object for updated Stripe PaymentIntent status - ✓
 * 12) Send text message to customer
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
async function cancelOwnDriverDeliveryPipeline(payload) {
    try {
        const uberDeliveryPipeline = new Pipeline([
            resetReturnMethod,
            cancelRouteDeliveryUow,
            cancelRouteDeliveryActivityLogUow,
            cancelOrderDelivery,
            issueRefundInStripe,
            createRefundModel,
            resetBalanceDueForRefund,
            markNextDeliveryOrderAsInProgressUOW,
            resetDeliveryFees,
            recalculateOrderTotals,
            revertServiceOrderDeliveryStatus,
            updateServiceOrderBags,
            deleteDeliveryOrderActivityLog,
        ]);
        const output = await uberDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = cancelOwnDriverDeliveryPipeline;
