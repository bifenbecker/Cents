const stripe = require('../../../stripe/stripeWithSecret');
const PaymentMethod = require('../../../models/paymentMethod');

/**
 * Get Stripe details for an individual PaymentMethod
 *
 * @param {Object} paymentMethod
 */
async function getStripeCardDetails(paymentMethod) {
    const cardDetails = {};
    const { centsCustomerId, id, paymentMethodToken, provider, type } = paymentMethod;

    if (paymentMethod.provider === 'stripe') {
        const stripeMethod = await stripe.paymentMethods.retrieve(paymentMethodToken);

        cardDetails.last4 = stripeMethod.card.last4;
        cardDetails.brand = stripeMethod.card.brand;
    } else {
        cardDetails.last4 = null;
        cardDetails.brand = null;
    }

    return {
        ...cardDetails,
        centsCustomerId,
        id,
        paymentMethodToken,
        provider,
        type,
    };
}

/**
 * Get all PaymentMethod model entries for a given CentsCustomer
 *
 * @param {Object} payload
 */
async function getCustomerPaymentMethods(payload) {
    try {
        const newPayload = payload;
        const { centsCustomerId, transaction } = newPayload;

        const paymentMethods = await PaymentMethod.query(transaction).where({
            centsCustomerId,
        });

        let formattedPaymentMethods = paymentMethods.map((method) => getStripeCardDetails(method));

        formattedPaymentMethods = await Promise.all(formattedPaymentMethods);

        newPayload.paymentMethods = formattedPaymentMethods;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

const TEST_ONLY = {
    getStripeCardDetails,
};

module.exports = {
    TEST_ONLY,
    getCustomerPaymentMethods,
};
