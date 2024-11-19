const Pipeline = require('../pipeline');

// Uows
const validateDoorDashDelivery = require('../../uow/delivery/doordash/validateDoorDashDeliveryUow');
const createDoorDashDelivery = require('../../uow/delivery/doordash/createDoordashDeliveryUow');
const createOrderDelivery = require('../../uow/delivery/dropoff/createOrderDeliveryUow');
const updateServiceOrderStatus = require('../../uow/delivery/dropoff/updateServiceOrderStatusUow');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const adjustOrderTotalsForDelivery = require('../../uow/delivery/dropoff/adjustOrderTotalsForDeliveryUow');
const determinePaymentAction = require('../../uow/delivery/dropoff/determinePaymentActionUow');
const createStripePaymentIntent = require('../../uow/delivery/dropoff/createStripePaymentIntentUow');
const updateStripePaymentIntent = require('../../uow/delivery/dropoff/updateStripePaymentIntentUow');
const resetBalanceDueForDelivery = require('../../uow/delivery/dropoff/resetBalanceDueForDeliveryUow');
const captureStripePaymentIntent = require('../../uow/delivery/dropoff/captureStripePaymentIntentUow');
const updatePayment = require('../../uow/delivery/dropoff/updatePaymentUow');

async function createDoorDashReturnDeliveryPipeline(payload) {
    try {
        const doorDashDeliveryPipeline = new Pipeline([
            validateDoorDashDelivery,
            createDoorDashDelivery,
            createOrderDelivery,
            updateServiceOrderStatus,
            createOrderActivityLog,
            adjustOrderTotalsForDelivery,
            determinePaymentAction,
            createStripePaymentIntent,
            updateStripePaymentIntent,
            captureStripePaymentIntent,
            updatePayment,
            resetBalanceDueForDelivery,
        ]);
        const output = await doorDashDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createDoorDashReturnDeliveryPipeline;
