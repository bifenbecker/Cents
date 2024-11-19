/**
 * Retrieve the expected response of the stripe.paymentMethods.retrieve(paymentMethodToken) function
 *
 * @param {String} paymentMethodToken
 * @return {{card: {last4: string, brand: string}}}
 */
function getExpectedStripePaymentMethods(paymentMethodToken) {
    return {
        card: {
            last4: '0942',
            brand: 'visa',
        }
    };
}

module.exports = exports = {
    getExpectedStripePaymentMethods,
}
