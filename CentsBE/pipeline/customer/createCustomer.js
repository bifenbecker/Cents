const Pipeline = require('../pipeline');

// Uows
const createCentsCustomer = require('../../uow/customer/createCentsCustomer');
const createStoreCustomer = require('../../uow/customer/createStoreCustomer');
const { createStripeCustomer } = require('../../uow/delivery/dropoff/createStripeCustomerUow');

async function createCustomerPipeline(payload) {
    try {
        const customerPipeline = new Pipeline([
            createCentsCustomer,
            createStoreCustomer,
            createStripeCustomer,
        ]);
        const output = await customerPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createCustomerPipeline;
