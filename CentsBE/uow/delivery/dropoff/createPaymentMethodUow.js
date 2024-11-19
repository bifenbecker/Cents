require('dotenv').config();

const stripe = require('../../../stripe/stripeWithSecret');

const PaymentMethod = require('../../../models/paymentMethod');

/**
 * Return the centsCustomer
 *
 * @param {String} paymentMethodId
 * @param {String} stripeCustomerToken
 */
async function attachPaymentMethodToStripeCustomer(paymentMethodId, stripeCustomerToken) {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerToken });
}

/**
 * Store the PaymentMethod model
 *
 * @param {Object} payload
 * @param {void} transaction
 */
async function storePaymentMethod(payload, transaction) {
    const { centsCustomerId, customer, payment } = payload;
    let paymentMethod;

    const existingPaymentMethod = await PaymentMethod.query().where({
        paymentMethodToken: payment.token,
        centsCustomerId,
    });

    if (!existingPaymentMethod.length) {
        paymentMethod = await PaymentMethod.query(transaction).insert({
            centsCustomerId,
            provider: payment.provider,
            type: payment.type,
            paymentMethodToken: payment.token,
        });
    } else {
        [paymentMethod] = existingPaymentMethod;
    }

    if (payment.provider === 'stripe') {
        await attachPaymentMethodToStripeCustomer(payment.token, customer.stripeCustomerId);
    }

    return paymentMethod;
}

/**
 * Use incoming payment token information to create a PaymentMethod for a CentsCustomer.
 *
 * If rememberPaymentMethod is selected, we store it in our database.
 * If provider is 'stripe', we should be storing this payment method with the Stripe Customer
 *
 * @param {Object} payload
 */
async function createPaymentMethod(payload) {
    try {
        const newPayload = payload;
        const { rememberPaymentMethod, transaction } = newPayload;

        if (rememberPaymentMethod) {
            const paymentMethod = await storePaymentMethod(newPayload, transaction);

            newPayload.paymentMethod = paymentMethod;

            return newPayload;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

const TEST_ONLY = {
    storePaymentMethod,
};

module.exports = {
    TEST_ONLY,
    createPaymentMethod,
};
