const Pipeline = require('../../pipeline');

// Uows
const { createStripeCustomer } = require('../../../uow/delivery/dropoff/createStripeCustomerUow');
const { createPaymentMethod } = require('../../../uow/delivery/dropoff/createPaymentMethodUow');
const {
    getCustomerPaymentMethods,
} = require('../../../uow/customer/paymentMethod/getCustomerPaymentMethodsUow');

async function addCustomerPaymentMethodPipeline(payload) {
    try {
        const uows = [createStripeCustomer, createPaymentMethod];
        if (payload.requireCustomerPaymentsList) {
            uows.push(getCustomerPaymentMethods);
        }

        const paymentMethodPipeline = new Pipeline(uows);
        const output = await paymentMethodPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = addCustomerPaymentMethodPipeline;
