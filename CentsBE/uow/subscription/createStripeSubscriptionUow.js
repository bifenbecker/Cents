require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Format the SubscriptionProduct model to fit Stripe's API parameters
 *
 * @param {Object} subscriptionProduct
 */
async function formatIndividualSubscriptionItems(subscriptionProduct) {
    const formattedData = {};

    formattedData.price = subscriptionProduct.stripePriceId;
    formattedData.quantity = subscriptionProduct.quantity;

    return formattedData;
}

/**
 * Create the Stripe Subscription
 *
 * @param {Object} payload
 */
async function createStripeSubscription(payload) {
    try {
        const newPayload = payload;
        const { business } = newPayload;
        const subscriptionProducts = newPayload.recurringItems;
        let formattedItems = subscriptionProducts.map((item) =>
            formatIndividualSubscriptionItems(item),
        );
        formattedItems = await Promise.all(formattedItems);

        const subscription = await stripe.subscriptions.create({
            customer: business.stripeCustomerToken,
            items: formattedItems,
        });

        newPayload.subscription = subscription;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripeSubscription;
