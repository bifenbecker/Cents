const Pipeline = require('../pipeline');

// Uows
const updateRouteDelivery = require('../../uow/driverApp/completeDeliveryOrder/updateRouteDeliveryUOW');
const createRouteDeliveryActivityLog = require('../../uow/driverApp/completeDeliveryOrder/createRouteDeliveryActivityLogUOW');
const updateDeliveryOrder = require('../../uow/driverApp/completeDeliveryOrder/updateOrderDeliveryUOW');
const updateServiceOrder = require('../../uow/driverApp/completeDeliveryOrder/updateServiceOrderUOW');
const updateServiceOrderBags = require('../../uow/driverApp/completeDeliveryOrder/updateServiceOrderBagsUOW');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const sendSMSforCompleteOrderDelivery = require('../../uow/driverApp/completeDeliveryOrder/sendSMSforCompletingDeliveryOrderUOW');
const markNextDeliveryOrderAsInProgressUOW = require('../../uow/driverApp/completePickupOrder/markNextOrderAsInProgressUOW');

// Used for return delivery order only
async function completeDeliveryOrderPipeline(payload) {
    try {
        const completeDelivery = new Pipeline([
            updateRouteDelivery,
            createRouteDeliveryActivityLog,
            updateDeliveryOrder,
            updateServiceOrder,
            createOrderActivityLog,
            updateServiceOrderBags,
            markNextDeliveryOrderAsInProgressUOW,
            sendSMSforCompleteOrderDelivery,
        ]);
        const output = await completeDelivery.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = completeDeliveryOrderPipeline;
