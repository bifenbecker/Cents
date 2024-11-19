const stripe = require('../config');

async function getSubscriptions(subscriptionId) {
    const subscriptions = await stripe.subscriptions.retrieve({
        subscriptionId,
    });
    return subscriptions;
}

module.exports = exports = getSubscriptions;
