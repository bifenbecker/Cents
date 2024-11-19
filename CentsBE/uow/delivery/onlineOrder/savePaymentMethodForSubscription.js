const { isEmpty } = require('lodash');
const PaymentMethod = require('../../../models/paymentMethod');
const { createPaymentMethod } = require('../dropoff/createPaymentMethodUow');
const StripePayment = require('../../../services/stripe/stripePayment');

async function savePaymentMethodForSubscription(payload) {
    try {
        const { paymentToken, centsCustomer, subscription } = payload;
        if (isEmpty(subscription) || !paymentToken) {
            return payload;
        }
        const existingPaymentMethod = await PaymentMethod.query()
            .where({
                paymentMethodToken: paymentToken,
                centsCustomerId: centsCustomer.id,
            })
            .first();

        if (!existingPaymentMethod) {
            const stripe = new StripePayment(paymentToken);
            const stripePaymentMethod = await stripe.retrievePaymentMethod();
            payload.customer = centsCustomer;
            payload.centsCustomerId = centsCustomer.id;
            payload.rememberPaymentMethod = true;
            payload.payment = {
                provider: 'stripe',
                type: stripePaymentMethod.type,
                token: paymentToken,
            };
            payload = await createPaymentMethod(payload);
        }
        return payload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = savePaymentMethodForSubscription;
