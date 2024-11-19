const Pipeline = require('../pipeline');

// Uows
const updateOrderDelivery = require('../../uow/delivery/dropoff/updateOrderDeliveryUow');
const markOrderAsComplete = require('../../uow/delivery/dropoff/markOrderAsCompleteUow');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const recalculateOrderTotals = require('../../uow/delivery/dropoff/recalculateOrderTotalsUow');

/**
 * Finalize and complete order details when a DoorDash delivery is complete.
 *
 * The pipeline contains the following units of work:
 *
 * 1) Update the status and fees of the OrderDelivery model for that delivery;
 * 2) Capture the charge for the delivery PaymentIntent in Stripe;
 * 3) Update the Payment model amount and status based on the captured PaymentIntent;
 * 4) Mark status of order and order items as complete;
 * 5) Update the ServiceOrderItem with the new delivery total;
 * 6) Update the ServiceReferenceItem with the new delivery total;
 * 7) Update the delivery line item with the new delivery total;
 *
 * @param {Object} payload
 */
async function completeDoorDashDeliveryPipeline(payload) {
    try {
        const doorDashDeliveryPipeline = new Pipeline([
            updateOrderDelivery,
            recalculateOrderTotals,
            markOrderAsComplete,
            createOrderActivityLog,
        ]);
        const output = await doorDashDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = completeDoorDashDeliveryPipeline;
