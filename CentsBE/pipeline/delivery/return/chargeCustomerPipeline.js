const Pipeline = require('../../pipeline');

// Uows
const updateServiceOrderStatus = require('../../../uow/delivery/dropoff/updateServiceOrderStatusUow');
const determinePaymentAction = require('../../../uow/delivery/dropoff/determinePaymentActionUow');
const createStripePaymentIntent = require('../../../uow/delivery/dropoff/createStripePaymentIntentUow');
const updateStripePaymentIntent = require('../../../uow/delivery/dropoff/updateStripePaymentIntentUow');
const resetBalanceDueForDelivery = require('../../../uow/delivery/dropoff/resetBalanceDueForDeliveryUow');
const captureStripePaymentIntent = require('../../../uow/delivery/dropoff/captureStripePaymentIntentUow');
const updatePayment = require('../../../uow/delivery/dropoff/updatePaymentUow');

async function chargeCustomerPipeline(payload) {
    try {
        const chargeCustomerPipeline = new Pipeline([
            updateServiceOrderStatus,
            determinePaymentAction,
            createStripePaymentIntent,
            updateStripePaymentIntent,
            captureStripePaymentIntent,
            updatePayment,
            resetBalanceDueForDelivery,
        ]);
        const output = await chargeCustomerPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = chargeCustomerPipeline;
