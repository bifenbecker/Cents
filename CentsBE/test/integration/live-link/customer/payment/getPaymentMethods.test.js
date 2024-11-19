require('../../../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { createCentsCustomerAndRelatedEntities } = require('../../../../support/createCustomerHelper');
const stripe = require('../../../../../routes/stripe/config');
const factory = require('../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const StripePayment = require('../../../../../services/stripe/stripePayment');
const { CREATE_STRIPE_INTENT_RESPONSE, CANCEL_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');

const apiEndpoint = '/api/v1/live-status/customer/payment';

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let response;

            it('should return correct response status and body when stripeMethod returns undefined', async () => {
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();

                await factory.create(FN.paymentMethod, {
                    centsCustomerId: centsCustomer.id,
                });

                response = await ChaiHttpRequestHelper.get(
                    `${apiEndpoint}/${centsCustomer.id}/payment-methods`,
                    { centsCustomerId: centsCustomer.id });

                const {
                    body: { paymentMethods },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('paymentMethods');
                expect(paymentMethods[0]).to.have.property('last4');
                expect(paymentMethods[0]).to.have.property('brand');
                expect(paymentMethods[0]).to.have.property('centsCustomerId');
                expect(paymentMethods[0]).to.have.property('provider');
                expect(paymentMethods[0]).to.have.property('type');
                expect(paymentMethods[0]).to.have.property('paymentMethodToken');
                expect(paymentMethods[0]).to.have.property('id');
            });

            it('should get stripeMethod', async () => {
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();

                const paymentMethod = await factory.create(FN.paymentMethod, {
                    centsCustomerId: centsCustomer.id,
                    provider: 'stripe',
                });

                sinon
                    .stub(stripe.paymentMethods, 'retrieve')
                    .callsFake(() => Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
                        payment_method: paymentMethod.paymentMethodToken,
                    }))
                    .returns({
                        card: {
                            last4: 1234,
                            brand: 'Visa',
                        },
                        id: 42,
                    });

                sinon
                    .stub(StripePayment.prototype, 'cancelPaymentIntent')
                    .callsFake(() => CANCEL_STRIPE_INTENT_RESPONSE);

                response = await ChaiHttpRequestHelper.get(
                    `${apiEndpoint}/${centsCustomer.id}/payment-methods`,
                    { centsCustomerId: centsCustomer.id }, {});

                const {
                    body: { paymentMethods },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('paymentMethods');
                expect(paymentMethods[0]).to.have.property('last4');
                expect(paymentMethods[0]).to.have.property('brand');
                expect(paymentMethods[0]).to.have.property('centsCustomerId');
                expect(paymentMethods[0]).to.have.property('provider');
                expect(paymentMethods[0]).to.have.property('type');
                expect(paymentMethods[0]).to.have.property('paymentMethodToken');
                expect(paymentMethods[0]).to.have.property('id');
            });

            it('should catch error', async () => {
                const { centsCustomer } = await createCentsCustomerAndRelatedEntities();

                await factory.create(FN.paymentMethod, {
                    centsCustomerId: centsCustomer.id,
                    provider: 'stripe',
                    paymentMethodToken: 'stripe',
                });

                response = await ChaiHttpRequestHelper.get(
                    `${apiEndpoint}/${centsCustomer.id}/payment-methods`,
                    { centsCustomerId: centsCustomer.id }, {});

                response.should.have.status(500);
            });
        });
    });
});