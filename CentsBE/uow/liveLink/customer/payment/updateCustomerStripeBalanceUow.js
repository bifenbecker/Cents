const Business = require('../../../../models/laundromatBusiness');
const {
    CENTS_IN_A_DOLLAR,
    CURRENCY_TYPES,
    origins,
    APPLICATION_FEE,
} = require('../../../../constants/constants');
const StripePayment = require('../../../../services/stripe/stripePayment');

async function updateCustomerStripeBalanceUow({
    credits,
    paymentMethodToken,
    currentCustomer,
    storeCustomer,
    transaction,
}) {
    const business = await Business.query(transaction).findById(storeCustomer.businessId);

    const amount = Number(credits) * CENTS_IN_A_DOLLAR;

    const stripeData = {
        amount,
        currency: CURRENCY_TYPES.USD,
        confirm: true,
        customer: currentCustomer.stripeCustomerId,
        metadata: {
            storeId: storeCustomer.storeId,
            customerEmail: currentCustomer.email,
            storeCustomerId: storeCustomer.id,
            origin: origins.LIVE_LINK,
        },
        payment_method: paymentMethodToken,
        transfer_data: {
            destination: business.merchantId,
        },
        on_behalf_of: business.merchantId,
        application_fee_amount: Math.round(amount * APPLICATION_FEE),
        off_session: false,
    };

    const paymentIntent = await StripePayment.createPaymentIntent(stripeData);

    return {
        transaction,
        paymentIntent,
        credits,
        storeCustomerId: storeCustomer.id,
        customerId: currentCustomer.id,
        businessId: storeCustomer.businessId,
    };
}

module.exports = exports = updateCustomerStripeBalanceUow;
