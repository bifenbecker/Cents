require('dotenv').config();

const stripe = require('../../stripe/stripeWithSecret');

/**
 * Update the Customer in Stripe with the new payment token
 *
 * @param {Object} payload
 */
async function updateStripeCustomer(payload) {
    try {
        const newPayload = payload;
        const customer = await stripe.customers.update(newPayload.business.stripeCustomerToken, {
            default_source: newPayload.paymentSource.id,
        });
        newPayload.stripeCustomer = customer;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateStripeCustomer;
