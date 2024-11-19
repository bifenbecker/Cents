const Pipeline = require('../../pipeline');

// Uows
const getUberAuthToken = require('../../../uow/delivery/dropoff/getUberAuthTokenUow');
const getUberDelivery = require('../../../uow/delivery/dropoff/getUberDeliveryUow');
const updateOrderDelivery = require('../../../uow/delivery/dropoff/updateOrderDeliveryUow');
const captureStripePaymentIntent = require('../../../uow/delivery/dropoff/captureStripePaymentIntentUow');
const updatePayment = require('../../../uow/delivery/dropoff/updatePaymentUow');
const markOrderAsComplete = require('../../../uow/delivery/dropoff/markOrderAsCompleteUow');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const recalculateOrderTotals = require('../../../uow/delivery/dropoff/recalculateOrderTotalsUow');
const sendTextMessageToCustomer = require('../../../uow/delivery/dropoff/sendTextMessageToCustomerUow');

/**
 * Finalize and complete order details when an Uber delivery is complete.
 *
 * The pipeline contains the following units of work:
 *
 * 1) Obtain Uber auth token (required to make requests to Uber's API);
 * 2) Get the Uber delivery status of the order via Uber API;
 * 3) Update the status and fees of the OrderDelivery model for that delivery;
 * 4) Capture the charge for the delivery PaymentIntent in Stripe;
 * 5) Update the Payment model amount and status based on the captured PaymentIntent;
 * 6) Mark status of order and order items as complete;
 * 7) Update the ServiceOrderItem with the new delivery total;
 * 8) Update the ServiceReferenceItem with the new delivery total;
 * 9) Update the delivery line item with the new delivery total;
 * 10) Send completion text to customer
 *
 * @param {Object} payload
 */
async function completeUberDeliveryPipeline(payload) {
    try {
        const uberDeliveryPipeline = new Pipeline([
            getUberAuthToken,
            getUberDelivery,
            updateOrderDelivery,
            recalculateOrderTotals,
            captureStripePaymentIntent,
            updatePayment,
            markOrderAsComplete,
            createOrderActivityLog,
            sendTextMessageToCustomer,
        ]);
        const output = await uberDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = completeUberDeliveryPipeline;
