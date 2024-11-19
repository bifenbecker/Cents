/**
 * Retrieve the expected response of the stripe.customers.create() function
 * 
 * @param {Object} stripePayload 
 */
 function generateExpectedStripeCustomerObject(stripePayload) {
    const expectedStripePayload = {
        id: 'cus_pierre',
        object: 'customer',
        address: {},
        balance: 0,
        created: '1593717111',
        currency: 'usd',
        default_source: null,
        delinquent: false,
        description: 'Pierre is my son',
        discount: null,
        email: stripePayload.email,
        invoice_prefix: 'PIERRE',
        invoice_settings: {
          custom_fields: null,
          default_payment_method: null,
          footer: null
        },
        livemode: false,
        metadata: {},
        name: stripePayload.name,
        next_invoice_sequence: 1,
        phone: stripePayload.phone,
        preferred_locales: [
          'en'
        ],
        shipping: {},
        tax_exempt: 'exempt',
        test_clock: null
    };
    return expectedStripePayload;
}

module.exports = exports = {
    generateExpectedStripeCustomerObject,
}
