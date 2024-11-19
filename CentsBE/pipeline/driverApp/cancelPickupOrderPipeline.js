const Pipeline = require('../pipeline');
// Uows
const cancelOrderDelivery = require('../../uow/driverApp/cancelOrderDelivery/cancelOrderDeliveryUOW');
const updateOrderDeliveryStatus = require('../../uow/driverApp/cancelPickupOrder/updateServiceOrderDeliveryStatusUow');
const updateServiceOrderBags = require('../../uow/driverApp/updateServiceorderBagsUOW');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const cancelStripePaymentIntent = require('../../uow/delivery/cancel/cancelStripePaymentIntentUow');
const sendSMSforCanceledPickupOrder = require('../../uow/driverApp/cancelPickupOrder/sendSMSforCanceledPickupOrderUOW');

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

async function cancelPickupOrderPipeline(payload) {
    try {
        const storePipeline = new Pipeline([
            cancelOrderDelivery,
            updateOrderDeliveryStatus,
            updateServiceOrderBags,
            createOrderActivityLog,
            cancelStripePaymentIntent,
            sendSMSforCanceledPickupOrder,
        ]);
        const output = await storePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = cancelPickupOrderPipeline;
