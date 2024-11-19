require('../../../../testHelper');
const sinon = require('sinon');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const { expect, assert } = require('../../../../support/chaiHelper');
const stripe = require('../../../../../stripe/stripeWithSecret');
const createStripePaymentIntentUow = require('../../../../../uow/ResidentialOrder/payment/createStripePaymentIntentUow');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');

let entities;
describe('test createStripePaymentIntent UoW', () => {
    afterEach(() => {
        sinon.restore();
    });
    describe('should return correct payload', () => {
        const assertCorrectResult = (
            newPayload,
            { laundromatBusiness, storeCustomer, centsCustomer, serviceOrder, order },
        ) => {
            expect(newPayload, 'newPayload should have property business').to.have.property(
                'business',
            );
            assert.containsAllDeepKeys(
                newPayload.business,
                laundromatBusiness,
                'newPayload should have valid laundromatBusiness',
            );
            expect(
                newPayload,
                'newPayload should have property stripePaymentIntent',
            ).to.have.property('stripePaymentIntent');
            assert.containsAllDeepKeys(
                newPayload.stripePaymentIntent,
                CREATE_STRIPE_INTENT_RESPONSE,
                'newPayload should have valid stripePaymentIntent',
            );
            expect(newPayload, 'newPayload should have property serviceOrder').to.have.property(
                'serviceOrder',
            );
            assert.containsAllDeepKeys(
                newPayload.serviceOrder,
                serviceOrder,
                'newPayload should have valid serviceOrder',
            );
            expect(newPayload, 'newPayload should have property order').to.have.property('order');
            assert.containsAllDeepKeys(
                newPayload.order,
                order,
                'newPayload should have valid order',
            );
            expect(newPayload, 'newPayload should have property storeCustomer').to.have.property(
                'storeCustomer',
            );
            assert.containsAllDeepKeys(
                newPayload.storeCustomer,
                storeCustomer,
                'newPayload should have valid storeCustomer',
            );
            expect(newPayload, 'newPayload should have property customer').to.have.property(
                'customer',
            );
            assert.containsAllDeepKeys(
                newPayload.customer,
                centsCustomer,
                'newPayload should have valid customer',
            );
        };

        beforeEach(async () => {
            const {
                laundromatBusiness,
                store,
                centsCustomer,
                storeCustomer,
                partnerSubsidiaryPaymentMethod,
                serviceOrder,
                order,
            } = await createUserWithBusinessAndCustomerOrders({ createPartnerSubsidiary: true });

            const payload = {
                store: {
                    id: store.id,
                    businessId: laundromatBusiness.id,
                },
                serviceOrderId: serviceOrder.id,
                storeCustomerId: storeCustomer.id,
                centsCustomerId: centsCustomer.id,
                paymentMethodToken: partnerSubsidiaryPaymentMethod.paymentMethodToken,
            };

            entities = {
                payload,
                laundromatBusiness,
                storeCustomer,
                centsCustomer,
                partnerStripeCustomerId: partnerSubsidiaryPaymentMethod.partnerStripeCustomerId,
                partnerSubsidiaryPaymentMethod: partnerSubsidiaryPaymentMethod.paymentMethodToken,
                serviceOrder,
                order,
            };
        });

        it('with partnerStripeCustomerId', async () => {
            const { payload, partnerStripeCustomerId } = entities;

            // call Uow
            const stripeResponse = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
                customer: partnerStripeCustomerId,
            });
            const stripeStub = sinon
                .stub(stripe.paymentIntents, 'create')
                .callsFake(() => stripeResponse);
            const newPayload = await createStripePaymentIntentUow(payload);

            // assert
            assertCorrectResult(newPayload, entities);

            const stripeArg = stripeStub.getCall(0).args[0];
            expect(stripeArg).to.have.property('customer');
            expect(
                stripeArg.customer,
                'stripe customer must be obtained from centsCustomer.stripeCustomerId',
            ).to.equals(partnerStripeCustomerId);
        });

        it('with centsCustomer.stripeCustomerId', async () => {
            const { payload, centsCustomer } = entities;

            // call Uow
            payload.paymentMethodToken = null;
            const stripeResponse = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
                customer: centsCustomer.stripeCustomerId,
            });
            const stripeStub = sinon
                .stub(stripe.paymentIntents, 'create')
                .callsFake(() => stripeResponse);
            const newPayload = await createStripePaymentIntentUow(payload);

            // assert
            assertCorrectResult(newPayload, entities);

            const stripeArg = stripeStub.getCall(0).args[0];
            expect(
                stripeArg.customer,
                'stripe customer must be obtained from stripeCustomerId',
            ).to.equals(centsCustomer.stripeCustomerId);
        });
    });
});
