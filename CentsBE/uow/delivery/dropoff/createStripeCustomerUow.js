require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');
const CentsCustomer = require('../../../models/centsCustomer');
const formatStripeCustomerData = require('../../../utils/stripe/formatStripeCustomerData');

/**
 * Create the Customer in Stripe and update the CentsCustomer model
 *
 * @param {Object} payload
 */
async function createStripeCustomer(payload) {
    try {
        const newPayload = payload;
        const { centsCustomerId, transaction } = newPayload;

        let customer = await CentsCustomer.query(transaction).findById(centsCustomerId);

        if (!customer.stripeCustomerId) {
            const stripeData = await formatStripeCustomerData(newPayload, customer);
            const stripeCustomer = await stripe.customers.create(stripeData);

            customer = await CentsCustomer.query(transaction)
                .findById(customer.id)
                .patch({
                    stripeCustomerId: stripeCustomer.id,
                })
                .returning('*');
        }

        newPayload.customer = customer;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = {
    createStripeCustomer,
};
