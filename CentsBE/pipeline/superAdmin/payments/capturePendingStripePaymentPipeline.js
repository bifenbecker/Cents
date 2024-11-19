const Pipeline = require('../../pipeline');

// Uows
const confirmStripePayment = require('../../../uow/superAdmin/payments/confirmStripePaymentUow');
const captureStripePayment = require('../../../uow/superAdmin/payments/captureStripePaymentUow');
const updateOrderPaymentStatus = require('../../../uow/superAdmin/orders/updateOrderPaymentStatusUow');

/**
 * Capture a pending payment and update the order accordingly
 *
 * The pipeline contains the following units of work:
 *
 * 1) Confirm the Stripe payment (if necessary);
 * 2) Capture the Stripe payment;
 * 3) Update the paymentStatus of ServiceOrder;
 * 4) Ensure balance due is properly recalculated and updated for the orderableType
 *
 * One note: in each of the Stripe UoWs, we are updating the status of the Payment model
 *
 * @param {Object} payload
 */
async function capturePendingStripePaymentPipeline(payload) {
    try {
        const paymentPipeline = new Pipeline([
            confirmStripePayment,
            captureStripePayment,
            updateOrderPaymentStatus,
        ]);
        const output = await paymentPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = capturePendingStripePaymentPipeline;
