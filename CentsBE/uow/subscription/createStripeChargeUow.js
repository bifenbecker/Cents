require('dotenv').config();

const stripe = require('../../stripe/stripeWithSecret');

/**
 * Get the Stripe price data for the item
 *
 * @param {Object} item
 */
async function getStripePrice(item) {
    const price = await stripe.prices.retrieve(item.stripePriceId);

    return price.unit_amount * item.quantity;
}

/**
 * Sum the total of each item in the array
 *
 * @param {Array} stripePrices
 */
async function getSumTotal(stripePrices) {
    const totalPrice = stripePrices.reduce((previous, currentItem) => previous + currentItem, 0);

    return totalPrice;
}

/**
 * Create a Charge to capture payment on non-recurring items
 *
 * @param {Object} payload
 */
async function createStripeCharge(payload) {
    try {
        const newPayload = payload;
        const { oneTimeItems } = newPayload;

        if (oneTimeItems.length === 0) return newPayload;

        let prices = oneTimeItems.map((item) => getStripePrice(item));

        prices = await Promise.all(prices);

        const sumTotal = await getSumTotal(prices);

        const charge = await stripe.charges.create({
            amount: sumTotal,
            currency: 'usd',
            customer: newPayload.business.stripeCustomerToken,
            source: newPayload.paymentSource.id,
        });

        newPayload.charge = charge;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripeCharge;
