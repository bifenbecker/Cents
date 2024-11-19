require('../../../../testHelper');
const sinon = require('sinon');
const { expect, assert } = require('../../../../support/chaiHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const createStripePaymentIntentUow = require('../../../../../uow/delivery/pickup/createStripePaymentIntentUow');
const StripePayment = require('../../../../../services/stripe/stripePayment');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');

describe('test createStripePaymentIntent UoW', () => {
    it('should return correct payload', async () => {
        const { laundromatBusiness, store, centsCustomer, storeCustomer, serviceOrder } =
            await createUserWithBusinessAndCustomerOrders();
        const payload = {
            store,
            serviceOrder,
            storeCustomer,
            customer: centsCustomer,
        };
        const stripePayload = {
            amount: 15000,
            currency: 'usd',
            customer: payload.customer.stripeCustomerId,
            metadata: {
                storeId: payload.store.id,
                customerEmail: payload.customer.email,
                orderableType: 'ServiceOrder - pickup delivery order',
                storeCustomerId: payload.storeCustomer.id,
                orderableId: payload.serviceOrder.id,
            },
            payment_method: payload.paymentToken,
            payment_method_types: ['card'],
            transfer_data: {
                destination: laundromatBusiness.merchantId,
            },
            on_behalf_of: laundromatBusiness.merchantId,
            application_fee_amount: Math.round(15000 * 0.04),
            capture_method: 'manual',
        };
        const stripeResponse = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, stripePayload);
        const stripeStub = sinon
            .stub(StripePayment, 'createPaymentIntent')
            .callsFake(() => stripeResponse);

        // call Uow
        const newPayload = await createStripePaymentIntentUow(payload);

        // assert
        const stripeArg = stripeStub.getCall(0).args[0];
        assert.deepOwnInclude(stripeArg, stripePayload);
        expect(newPayload).to.have.property('business').to.eql(laundromatBusiness);
        expect(newPayload).to.have.property('stripePaymentIntent').to.eql(stripeResponse);
    });

    it('should throw Error in case of problems with Stripe API', async () => {
        const errorMessage = 'Unprovided error!';
        const { laundromatBusiness, store, centsCustomer, storeCustomer, serviceOrder } =
            await createUserWithBusinessAndCustomerOrders();
        const payload = {
            store: {
                id: store.id,
                businessId: laundromatBusiness.id,
            },
            serviceOrder,
            storeCustomer,
            customer: centsCustomer,
            centsCustomerId: centsCustomer.id,
        };
        sinon.stub(StripePayment, 'createPaymentIntent').callsFake(() => {
            throw new Error(errorMessage);
        });

        // assert
        await expect(createStripePaymentIntentUow(payload)).to.be.rejectedWith(errorMessage);
    });
});
