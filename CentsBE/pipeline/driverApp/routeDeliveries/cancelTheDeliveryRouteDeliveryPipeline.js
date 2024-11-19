const Pipeline = require('../../pipeline');

// Uows
const cancelTheRouteDeliveryUOW = require('../../../uow/driverApp/cancelTheRouteDeliveryUOW');
const cancelOrderDelivery = require('../../../uow/driverApp/cancelOrderDelivery/cancelOrderDeliveryUOW');
const revertServiceOrderDeliveryStatus = require('../../../uow/delivery/cancel/revertServiceOrderDeliveryStatusUow');
const deleteDeliveryOrderActivityLog = require('../../../uow/delivery/cancel/deleteDeliveryOrderActivityLogUow');
const updateServiceOrderBags = require('../../../uow/driverApp/updateServiceorderBagsUOW');
const markNextDeliveryOrderAsInProgressUOW = require('../../../uow/driverApp/completePickupOrder/markNextOrderAsInProgressUOW');
const sendTheDeliveryFailedSMSForRouteDeliveryUOW = require('../../../uow/driverApp/sendTheDeliveryFailedSMSForRouteDeliveryUOW');
const cancelRouteDeliveryActivityLogUOW = require('../../../uow/driverApp/cancelRouteDeliveryActivityLogUOW');
const createRefundModel = require('../../../uow/refunds/createRefundModelUow');
const resetDeliveryFees = require('../../../uow/delivery/cancel/resetDeliveryFeesUow');
const partialRefundPaymentUow = require('../../../uow/liveLink/serviceOrders/partialRefundPaymentUow');
const detemineRefundableAmount = require('../../../uow/liveLink/serviceOrders/detemineRefundableAmount');
const resetNetOrderTotalForCancelledDelivery = require('../../../uow/driverApp/resetNetOrderTotalForCancelledDelivery');

async function cancelTheDeliveryRouteDeliveryPipeline(payload) {
    try {
        const pipeline = new Pipeline([
            cancelTheRouteDeliveryUOW,
            cancelRouteDeliveryActivityLogUOW,
            cancelOrderDelivery,
            detemineRefundableAmount,
            partialRefundPaymentUow,
            createRefundModel,
            resetDeliveryFees,
            resetNetOrderTotalForCancelledDelivery,
            revertServiceOrderDeliveryStatus,
            updateServiceOrderBags,
            markNextDeliveryOrderAsInProgressUOW,
            deleteDeliveryOrderActivityLog,
            sendTheDeliveryFailedSMSForRouteDeliveryUOW,
        ]);

        const output = await pipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = cancelTheDeliveryRouteDeliveryPipeline;
