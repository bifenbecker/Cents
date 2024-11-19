const Pipeline = require('../pipeline');
// Uows
const cancelOrderDelivery = require('../../uow/driverApp/cancelOrderDelivery/cancelOrderDeliveryUOW');
const revertServiceOrderDeliveryStatus = require('../../uow/delivery/cancel/revertServiceOrderDeliveryStatusUow');
const updateServiceOrderBags = require('../../uow/driverApp/updateServiceorderBagsUOW');
const deleteDeliveryOrderActivityLog = require('../../uow/delivery/cancel/deleteDeliveryOrderActivityLogUow');
const sendSMSforCanceledDeliveryOrder = require('../../uow/driverApp/cancelOrderDelivery/sendSMSforCanceledDeliveryOrderUOW');
const createRefundModel = require('../../uow/refunds/createRefundModelUow');
const resetDeliveryFees = require('../../uow/delivery/cancel/resetDeliveryFeesUow');
const partialRefundPaymentUow = require('../../uow/liveLink/serviceOrders/partialRefundPaymentUow');
const detemineRefundableAmount = require('../../uow/liveLink/serviceOrders/detemineRefundableAmount');

const resetNetOrderTotalForCancelledDelivery = require('../../uow/driverApp/resetNetOrderTotalForCancelledDelivery');

/**
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

async function cancelDeliveryOrderPipeline(payload) {
    try {
        const storePipeline = new Pipeline([
            cancelOrderDelivery,
            detemineRefundableAmount,
            partialRefundPaymentUow,
            createRefundModel,
            resetDeliveryFees,
            resetNetOrderTotalForCancelledDelivery,
            revertServiceOrderDeliveryStatus,
            updateServiceOrderBags,
            deleteDeliveryOrderActivityLog,
            sendSMSforCanceledDeliveryOrder,
        ]);
        const output = await storePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = cancelDeliveryOrderPipeline;
