const Pipeline = require('../../pipeline');

// Uows
const createPaymentIntent = require('../../../uow/stripe/employeeTab/createPaymentIntentUow');
const formatPaymentObject = require('../../../uow/stripe/employeeTab/formatPaymentObjectUow');
const createPayment = require('../../../uow/stripe/employeeTab/createPaymentUow');

/**
 * Run the pipeline to create a PaymentIntent and update the various models
 *
 * The pipeline contains the following units of work:
 *
 * 1) Create Stripe PaymentIntent;
 * 2) Format the body for the Payment object in our DB
 * 3) Create the Payment using the formatted payment body in step 2
 *
 * @param {Object} payload
 */
async function createPaymentIntentPipeline(payload) {
    try {
        const stripePaymentIntentPipeline = new Pipeline([
            createPaymentIntent,
            formatPaymentObject,
            createPayment,
        ]);
        const output = await stripePaymentIntentPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createPaymentIntentPipeline;
