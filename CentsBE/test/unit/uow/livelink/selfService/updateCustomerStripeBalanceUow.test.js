require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');

const updateCustomerStripeBalanceUow = require('../../../../../uow/liveLink/customer/payment/updateCustomerStripeBalanceUow');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const sinon = require('sinon');
const { CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');
const { PAYMENT_INTENT_STATUSES } = require('../../../../../constants/constants');
const StripePayment = require('../../../../../services/stripe/stripePayment');

describe('updateCustomerStripeBalanceUow', function () {
    let centsCustomer;
    let store;
    let storeCustomer;
    let paymentMethod;

    beforeEach(async function () {
        centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
        store = await factory.create(FACTORIES_NAMES.store);
        storeCustomer = await factory.create(FACTORIES_NAMES.storeCustomer, {
            centsCustomerId: centsCustomer.id,
            storeId: store.id,
            businessId: store.businessId,
        });
        paymentMethod = await factory.build(FACTORIES_NAMES.paymentMethod, {
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should return status succeeded if payment intent created and successfully confirmed', async function () {
        sinon
            .stub(StripePayment, 'createPaymentIntent')
            .returns(CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE);

        const actual = await updateCustomerStripeBalanceUow({
            credits: 10,
            paymentMethodToken: paymentMethod.paymentMethodToken,
            currentCustomer: centsCustomer,
            storeCustomer,
        });

        expect(actual).to.deep.eq({
            paymentIntent: CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE,
            credits: 10,
            storeCustomerId: storeCustomer.id,
            customerId: centsCustomer.id,
            businessId: storeCustomer.businessId,
            transaction: undefined,
        });
        expect(actual.paymentIntent.status).to.eq(PAYMENT_INTENT_STATUSES.SUCCEEDED);
    });
});
