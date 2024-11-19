require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Business = require('../../models/laundromatBusiness');

/**
 * Take incoming payload and format it for Stripe's data model
 *
 * @param {Object} request
 */
async function formatStripeData(request) {
    const formattedData = {};
    const { address } = request;

    if (address) {
        formattedData.address = {
            line1: address.address,
            city: address.city,
            country: 'US',
            postal_code: address.zipCode,
            state: address.state,
        };
    }

    formattedData.email = request.businessOwner.email;
    formattedData.name = request.businessName;
    formattedData.phone = request.businessOwner.phone;

    return formattedData;
}

/**
 * Create the Customer in Stripe and update the LaundromatBusiness model
 *
 * @param {Object} payload
 */
async function createStripeCustomer(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const stripeData = await formatStripeData(newPayload);
        const customer = await stripe.customers.create(stripeData);

        const business = await Business.query(transaction)
            .findById(newPayload.business.id)
            .patch({
                stripeCustomerToken: customer.id,
            })
            .returning('*');

        newPayload.business = business;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createStripeCustomer;
