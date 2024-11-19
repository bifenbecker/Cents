require('../../../../testHelper');
const ChaiHttpRequestHelper = require('../../../../support/chaiHttpRequestHelper');
const { generateLiveLinkCustomerToken } = require('../../../../support/apiTestHelper');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');
const sinon = require('sinon');
const { CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE } = require('../../../../constants/responseMocks');
const StripePayment = require('../../../../../services/stripe/stripePayment');

const apiEndpoint = '/api/v1/live-status/customer/payment/fill-balance';

describe('test livelink fillBalance API', function () {
    describe('when auth token validation fails', function () {
        it('should respond with a 401 code when customer auth token is absent', async function () {
            const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, {});
            response.should.have.status(401);
        });
        it('should respond with a 404 when customer auth token is invalid', async function () {
            const token = generateLiveLinkCustomerToken({ id: 100 });
            const response = await ChaiHttpRequestHelper.post(
                apiEndpoint,
                {},
                {
                    credits: 2,
                    paymentMethodToken: 'pm_1L98sDGuj5YLpJjFEvY99wx0',
                    storeId: 13,
                },
            ).set('customerauthtoken', token);
            response.should.have.status(404);
        });
    });

    describe('when auth token is valid', function () {
        let token;
        let centsCustomer;
        let store;
        let paymentMethod;
        let business;

        beforeEach(async function () {
            centsCustomer = await factory.create(FACTORIES_NAMES.centsCustomer);
            business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
            store = await factory.create(FACTORIES_NAMES.store, {
                businessId: business.id,
            });
            paymentMethod = await factory.build(FACTORIES_NAMES.paymentMethod, {
                centsCustomerId: centsCustomer.id,
            });
            token = generateLiveLinkCustomerToken({ id: centsCustomer.id });
        });

        describe('when params are invalid', function () {
            it('should respond with a 422 code if storeId is missed', async function () {
                const res = await ChaiHttpRequestHelper.post(
                    apiEndpoint,
                    {},
                    {
                        credits: 12,
                        paymentMethodToken: paymentMethod.paymentMethodToken,
                    },
                ).set('customerauthtoken', token);

                res.should.have.status(422);
                expect(res.body.error).to.eql('Store Id must be provided');
            });
            it('should respond with a 422 code if payment method token is missed', async function () {
                const res = await ChaiHttpRequestHelper.post(
                    apiEndpoint,
                    {},
                    {
                        credits: 12,
                        storeId: store.id,
                    },
                ).set('customerauthtoken', token);

                res.should.have.status(422);
                expect(res.body.error).to.eql('Payment method must be provided');
            });
            it('should respond with a 422 code if credits below 5', async function () {
                const res = await ChaiHttpRequestHelper.post(
                    apiEndpoint,
                    {},
                    {
                        credits: 2,
                        paymentMethodToken: paymentMethod.paymentMethodToken,
                        storeId: store.id,
                    },
                ).set('customerauthtoken', token);

                res.should.have.status(422);
                expect(res.body.error).to.eql(
                    'Credits are required and should be equal or greater than 5',
                );
            });
        });
        describe('when params are valid', function () {
            it('should return success and status code 200 if balance is successfully updated', async function () {
                sinon
                    .stub(StripePayment, 'createPaymentIntent')
                    .returns(CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE);

                const res = await ChaiHttpRequestHelper.post(
                    apiEndpoint,
                    {},
                    {
                        credits: 22,
                        paymentMethodToken: paymentMethod.paymentMethodToken,
                        storeId: store.id,
                    },
                ).set('customerauthtoken', token);

                res.should.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.availableCredits).to.eql(22);
                expect(res.body.paymentIntent).to.eql(CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE);
            });
            it('should return success, status code 200 and availableCredits equal to sum of different stores related to one business', async function () {
                sinon
                    .stub(StripePayment, 'createPaymentIntent')
                    .returns(CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE);

                await ChaiHttpRequestHelper.post(
                    apiEndpoint,
                    {},
                    {
                        credits: 22,
                        paymentMethodToken: paymentMethod.paymentMethodToken,
                        storeId: store.id,
                    },
                ).set('customerauthtoken', token);

                const store2 = await factory.create(FACTORIES_NAMES.store, {
                    businessId: business.id,
                });

                const res = await ChaiHttpRequestHelper.post(
                    apiEndpoint,
                    {},
                    {
                        credits: 10,
                        paymentMethodToken: paymentMethod.paymentMethodToken,
                        storeId: store2.id,
                    },
                ).set('customerauthtoken', token);

                res.should.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.availableCredits).to.eql(32);
                expect(res.body.paymentIntent).to.eql(CREATE_LIVE_LINK_STRIPE_INTENT_RESPONSE);
            });
        });
    });
});
