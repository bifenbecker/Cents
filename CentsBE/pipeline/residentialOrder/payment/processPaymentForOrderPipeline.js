const Pipeline = require('../../pipeline');

// Uows
const createStripePaymentIntent = require('../../../uow/ResidentialOrder/payment/createStripePaymentIntentUow');
const createPaymentModel = require('../../../uow/ResidentialOrder/payment/createPaymentModelUow');
const updateServiceOrderForPayment = require('../../../uow/ResidentialOrder/payment/updateServiceOrderForPaymentUow');
const cancelDuplicatePendingPayment = require('../../../uow/order/serviceOrder/cancelDuplicatePendingPayment');

async function processPaymentForOrderPipeline(payload) {
    try {
        const paymentPipeline = new Pipeline([
            createStripePaymentIntent,
            createPaymentModel,
            updateServiceOrderForPayment,
            // canceling the previous pending payment which is created during manage order delivery(intent-created) scheduling.
            // to avoid explicit handling of stripe external api errors
            cancelDuplicatePendingPayment,
        ]);
        const output = await paymentPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = processPaymentForOrderPipeline;
