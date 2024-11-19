const Pipeline = require('../../pipeline');

// Uows
const cancelTheRouteDeliveryUOW = require('../../../uow/driverApp/cancelTheRouteDeliveryUOW');
const cancelOrderDelivery = require('../../../uow/driverApp/cancelOrderDelivery/cancelOrderDeliveryUOW');
const updateOrderDeliveryStatus = require('../../../uow/driverApp/cancelPickupOrder/updateServiceOrderDeliveryStatusUow');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const cancelStripePaymentIntent = require('../../../uow/delivery/cancel/cancelStripePaymentIntentUow');
const updateServiceOrderBags = require('../../../uow/driverApp/updateServiceorderBagsUOW');
const markNextDeliveryOrderAsInProgressUOW = require('../../../uow/driverApp/completePickupOrder/markNextOrderAsInProgressUOW');
const cancelRouteDeliveryActivityLogUOW = require('../../../uow/driverApp/cancelRouteDeliveryActivityLogUOW');
const sendSMSforCancelledPickupOrderUOW = require('../../../uow/driverApp/sendSMSforCancellingPickupUOW');

async function cancelThePickupRouteDeliveryPipeline(payload) {
    try {
        const pipeline = new Pipeline([
            cancelTheRouteDeliveryUOW,
            cancelRouteDeliveryActivityLogUOW,
            cancelOrderDelivery,
            updateOrderDeliveryStatus,
            updateServiceOrderBags,
            markNextDeliveryOrderAsInProgressUOW,
            createOrderActivityLog,
            cancelStripePaymentIntent,
            sendSMSforCancelledPickupOrderUOW,
        ]);

        const output = await pipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = cancelThePickupRouteDeliveryPipeline;
