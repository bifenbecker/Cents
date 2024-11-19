const CentsCustomer = require('../models/centsCustomer');
const { createStripeCustomer } = require('../uow/delivery/dropoff/createStripeCustomerUow');
const LoggerHandler = require('../LoggerHandler/LoggerHandler');

/**
 * generateStripeKeyAndUpdate
 * @param {Array} customers
 * @description Generates stripe customer ids and update to the Database.
 */
async function generateStripeCustomerIdAndUpdate(customers) {
    try {
        const customerKeys = [];
        customers.forEach((customer) => {
            customerKeys.push(createStripeCustomer({ centsCustomerId: customer.id }));
        });
        await Promise.all(customerKeys);
    } catch (err) {
        LoggerHandler('error', err);
    }
}

/**
 * createStripeCustomers
 * @param {Number} limit
 * @description Create stripe customer ids which do not have in the Database. limit is optional
 */
async function createStripeCustomers() {
    try {
        const customers = await CentsCustomer.query().where({ stripeCustomerId: null });
        // It will generate 10 stripe customers for each iteration
        for (let i = 0; i < customers.length; i += 10) {
            await generateStripeCustomerIdAndUpdate(customers.slice(i, i + 10));
            LoggerHandler('info', `Completed for....${i + 10}`);
        }
    } catch (error) {
        const errMsg = `Error occured while adding stripeCustomerId to centsCustomer table:\n\n${error}`;
        LoggerHandler('error', errMsg);
    }
}

module.exports = createStripeCustomers;
