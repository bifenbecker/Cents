const Pipeline = require('../pipeline');

// Uows
const updateOrderDeliveryStatus = require('../../uow/delivery/dropoff/updateOrderDeliveryStatusUow');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const updateServiceOrderStatus = require('../../uow/delivery/dropoff/updateServiceOrderStatusUow');

/**
 * Update the OrderDelivery and customer based on incoming status change
 *
 * The pipeline contains the following units of work:
 *
 * 1) Update the status of the OrderDelivery model;
 * 2) Update the status of the ServiceOrder model based on uber status;
 *
 * @param {Object} payload
 */
async function updateDoorDashDeliveryPipeline(payload) {
    try {
        const uberDeliveryPipeline = new Pipeline([
            updateOrderDeliveryStatus,
            updateServiceOrderStatus,
            createOrderActivityLog,
        ]);
        const output = await uberDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateDoorDashDeliveryPipeline;
