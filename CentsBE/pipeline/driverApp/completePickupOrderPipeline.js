const Pipeline = require('../pipeline');

// Uows
const updateRouteDelivery = require('../../uow/driverApp/completePickupOrder/updateRouteDeliveryUOW');
const createRouteDeliveryActivityLog = require('../../uow/driverApp/completeDeliveryOrder/createRouteDeliveryActivityLogUOW');
const updateDeliveryOrder = require('../../uow/driverApp/completePickupOrder/updateOrderDeliveryUOW');
const updateServiceOrder = require('../../uow/driverApp/completePickupOrder/updateServiceOrderUOW');
const markNextPickupOrderAsInprogress = require('../../uow/driverApp/completePickupOrder/markNextOrderAsInProgressUOW');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const createServiceOrderBags = require('../../uow/driverApp/completePickupOrder/createServiceOrderBagsUOW');

async function completePickupOrderPipeline(payload) {
    try {
        const completePickup = new Pipeline([
            updateRouteDelivery,
            createRouteDeliveryActivityLog,
            updateDeliveryOrder,
            updateServiceOrder,
            createOrderActivityLog,
            createServiceOrderBags,
            markNextPickupOrderAsInprogress,
        ]);
        const output = await completePickup.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = completePickupOrderPipeline;
