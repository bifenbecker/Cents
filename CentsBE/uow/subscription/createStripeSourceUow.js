require('dotenv').config();

const stripe = require('../../stripe/stripeWithSecret');
const Business = require('../../models/laundromatBusiness');

/**
 * Create a Stripe Source for the Customer
 *
 * @param {Object} payload
 */
async function createStripeSource(payload) {
    try {
        const newPayload = payload;
        const business = await Business.query().findById(newPayload.businessId);
        const source = await stripe.customers.createSource(business.stripeCustomerToken, {
            source: newPayload.paymentToken,
        });

        newPayload.business = business;
        newPayload.paymentSource = source;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripeSource;
