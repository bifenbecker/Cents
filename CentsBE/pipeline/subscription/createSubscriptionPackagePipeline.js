const Pipeline = require('../pipeline');

// Uows
const createBusinessOwner = require('../../uow/subscription/createBusinessOwnerUow');
const createLaundromatBusiness = require('../../uow/subscription/createLaundromatBusinessUow');
const createStripeCustomer = require('../../uow/subscription/createStripeCustomerUow');
const createSubscriptionProductList = require('../../uow/subscription/createSubscriptionProductListUow');
const eventEmitter = require('../../config/eventEmitter');
const { emailNotificationEvents } = require('../../constants/constants');

async function createSubscriptionPackagePipeline(payload) {
    try {
        const subscriptionPipeline = new Pipeline([
            createBusinessOwner,
            createLaundromatBusiness,
            createStripeCustomer,
            createSubscriptionProductList,
        ]);
        const output = await subscriptionPipeline.run(payload);
        eventEmitter.emit('emailNotification', emailNotificationEvents.CENTS_QUOTE, output);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createSubscriptionPackagePipeline;
