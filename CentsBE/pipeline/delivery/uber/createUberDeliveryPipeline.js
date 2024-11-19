const Pipeline = require('../../pipeline');

// Uows
const createUberDelivery = require('../../../uow/delivery/dropoff/createUberDeliveryUow');
const createOrderDelivery = require('../../../uow/delivery/dropoff/createOrderDeliveryUow');
const updateServiceOrderStatus = require('../../../uow/delivery/dropoff/updateServiceOrderStatusUow');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const adjustOrderTotalsForDelivery = require('../../../uow/delivery/dropoff/adjustOrderTotalsForDeliveryUow');
const determinePaymentAction = require('../../../uow/delivery/dropoff/determinePaymentActionUow');
const createStripePaymentIntent = require('../../../uow/delivery/dropoff/createStripePaymentIntentUow');
const updateStripePaymentIntent = require('../../../uow/delivery/dropoff/updateStripePaymentIntentUow');
const resetBalanceDueForDelivery = require('../../../uow/delivery/dropoff/resetBalanceDueForDeliveryUow');

async function createUberDeliveryPipeline(payload) {
    try {
        const uberDeliveryPipeline = new Pipeline([
            createUberDelivery,
            createOrderDelivery,
            updateServiceOrderStatus,
            createOrderActivityLog,
            adjustOrderTotalsForDelivery,
            determinePaymentAction,
            createStripePaymentIntent,
            updateStripePaymentIntent,
            resetBalanceDueForDelivery,
        ]);
        const output = await uberDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createUberDeliveryPipeline;
