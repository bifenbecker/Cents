const Pipeline = require('../pipeline');

// Uows
const updateStripePaymentIntentPaymentMethod = require('../../uow/order/updatePaymentIntentPaymentMethod');

async function updatePaymentIntentPaymentMethodPipeline(payload) {
    try {
        const updatePaymentMethodPipeline = new Pipeline([updateStripePaymentIntentPaymentMethod]);
        const output = await updatePaymentMethodPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updatePaymentIntentPaymentMethodPipeline;
