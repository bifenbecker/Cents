const Pipeline = require('../../pipeline');

// Uows
const createOrderDelivery = require('../../../uow/delivery/dropoff/createOrderDeliveryUow');
const updateServiceOrderStatus = require('../../../uow/delivery/dropoff/updateServiceOrderStatusUow');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const adjustOrderTotalsForDelivery = require('../../../uow/delivery/dropoff/adjustOrderTotalsForDeliveryUow');
const determinePaymentAction = require('../../../uow/delivery/dropoff/determinePaymentActionUow');
const createStripePaymentIntent = require('../../../uow/delivery/dropoff/createStripePaymentIntentUow');
const updateStripePaymentIntent = require('../../../uow/delivery/dropoff/updateStripePaymentIntentUow');
const resetBalanceDueForDelivery = require('../../../uow/delivery/dropoff/resetBalanceDueForDeliveryUow');
const createCustomerAddress = require('../../../uow/customer/address/createCustomerAddressUow');
const captureStripePaymentIntent = require('../../../uow/delivery/dropoff/captureStripePaymentIntentUow');
const updatePayment = require('../../../uow/delivery/dropoff/updatePaymentUow');
const updateReturnMethod = require('../../../uow/order/updateReturnMethod');

async function createOwnNetworkReturnDeliveryPipeline(payload) {
    try {
        const ownNetworkPipeline = new Pipeline([
            createCustomerAddress,
            createOrderDelivery,
            updateServiceOrderStatus,
            updateReturnMethod,
            createOrderActivityLog,
            adjustOrderTotalsForDelivery,
            determinePaymentAction,
            createStripePaymentIntent,
            updateStripePaymentIntent,
            captureStripePaymentIntent,
            updatePayment,
            resetBalanceDueForDelivery,
        ]);
        const output = await ownNetworkPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createOwnNetworkReturnDeliveryPipeline;
