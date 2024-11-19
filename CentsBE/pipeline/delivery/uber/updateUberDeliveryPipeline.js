const Pipeline = require('../../pipeline');

// Uows
const getUberAuthToken = require('../../../uow/delivery/dropoff/getUberAuthTokenUow');
const getUberDelivery = require('../../../uow/delivery/dropoff/getUberDeliveryUow');
const updateOrderDeliveryStatus = require('../../../uow/delivery/dropoff/updateOrderDeliveryStatusUow');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const updateServiceOrderStatus = require('../../../uow/delivery/dropoff/updateServiceOrderStatusUow');
const sendTextMessageToCustomer = require('../../../uow/delivery/dropoff/sendTextMessageToCustomerUow');

/**
 * Update the OrderDelivery and customer based on incoming status change
 *
 * The pipeline contains the following units of work:
 *
 * 1) Update the status of the OrderDelivery model;
 * 2) Update the status of the ServiceOrder model based on uber status;
 * 3) Send text message to customer based on status
 *
 * @param {Object} payload
 */
async function updateUberDeliveryPipeline(payload) {
    try {
        const uberDeliveryPipeline = new Pipeline([
            getUberAuthToken,
            getUberDelivery,
            updateOrderDeliveryStatus,
            updateServiceOrderStatus,
            createOrderActivityLog,
            sendTextMessageToCustomer,
        ]);
        const output = await uberDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateUberDeliveryPipeline;
