const Pipeline = require('../pipeline');

// Uows
const createStripeSource = require('../../uow/subscription/createStripeSourceUow');
const updateStripeCustomer = require('../../uow/subscription/updateStripeCustomerUow');
const createStripeSubscription = require('../../uow/subscription/createStripeSubscriptionUow');
const createStripeCharge = require('../../uow/subscription/createStripeChargeUow');
const createBusinessSubscription = require('../../uow/subscription/createBusinessSubscriptionUow');
const createTermsOfServiceLogEntry = require('../../uow/subscription/createTermsOfServiceLogEntryUow');
const eventEmitter = require('../../config/eventEmitter');
const { emailNotificationEvents } = require('../../constants/constants');

async function payForSubscriptionPipeline(payload) {
    try {
        const subscriptionPipeline = new Pipeline([
            createStripeSource,
            updateStripeCustomer,
            createStripeSubscription,
            createStripeCharge,
            createBusinessSubscription,
            createTermsOfServiceLogEntry,
        ]);
        const output = await subscriptionPipeline.run(payload);
        eventEmitter.emit('emailNotification', emailNotificationEvents.VERIFY_ACCOUNT, output);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = payForSubscriptionPipeline;
