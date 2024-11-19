require('../../testHelper');
const sinon = require('sinon');
const { expect } = require('../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../support/pipelineTestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const factory = require('../../factories');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const stripe = require('../../../stripe/stripeWithSecret');
const ServiceOrderQuery = require('../../../services/queries/serviceOrder');
const StripePayment = require('../../../services/stripe/stripePayment');
const { paymentStatuses } = require('../../../constants/constants');
const { PAYMENT_INTENT_STATUSES } = require('../../constants/statuses');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const {
    CREATE_STRIPE_INTENT_RESPONSE,
    CANCEL_STRIPE_INTENT_RESPONSE,
} = require('../../constants/responseMocks');

const endpointName = 'live-status/payment/process';
const apiEndpoint = `/api/v1/${endpointName}`;
describe(`test ${apiEndpoint} API endpoint`, () => {
    afterEach(() => {
        sinon.restore();
    });
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            let stubbedPipelineRun;
            let response;

            beforeEach(async () => {
                const orderDelivery = await factory.create('serviceOrderMasterOrder');
                const mockedResult = await endpointPipelineMock({
                    pipelineReturn: { serviceOrder: { id: orderDelivery.orderableId } },
                    method: 'post',
                    apiEndpoint,
                });
                stubbedPipelineRun = mockedResult.stubbedPipelineRun;
                response = mockedResult.response;
            });

            it('should return correct response', () => {
                expect(stubbedPipelineRun.called, 'pipeline run should be called').to.be.true;
                response.should.have.status(200);
                response.body.should.not.be.empty;
                response.body.should.have.property('order');
                response.body.should.have.property('output');
                response.body.should.have.property('success', true);
            });
        });

        describe('that running with error', () => {
            let response;
            beforeEach(async () => {
                response = await endpointPipelineErrorMock({
                    method: 'post',
                    apiEndpoint,
                });
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with full Pipeline stages', async () => {
        const makeRequest = async ({ isPartner, isFullPaid, createDuplicatePayment }) => {
            const applicationFee = 0.6;
            const stripeApplicationFee = applicationFee * 100;
            const {
                store,
                centsCustomer,
                storeCustomer,
                partnerSubsidiaryPaymentMethod,
                partnerSubsidiaryPaymentMethod: { paymentMethodToken },
                serviceOrder,
                order,
            } = await createUserWithBusinessAndCustomerOrders({ createPartnerSubsidiary: true });

            let amount = serviceOrder.netOrderTotal * 100;
            if (!isFullPaid) {
                amount /= 2;
            }
            const stripeResponse = Object.assign(CREATE_STRIPE_INTENT_RESPONSE, {
                amount,
                amount_received: amount,
                application_fee_amount: stripeApplicationFee,
                charges: {
                    data: [
                        {
                            amount,
                            amount_captured: amount,
                            application_fee_amount: stripeApplicationFee,
                            payment_method_details: {
                                card: { amount_authorized: amount },
                            },
                        },
                    ],
                },
            });
            sinon
                .stub(stripe.paymentIntents, 'create')
                .callsFake(({ customer }) => ({ ...stripeResponse, customer }));
            sinon
                .stub(stripe.paymentIntents, 'retrieve')
                .withArgs(CREATE_STRIPE_INTENT_RESPONSE.id)
                .returns({
                    payment_method: CREATE_STRIPE_INTENT_RESPONSE.payment_method,
                    status: 'requires_confirmation'
                });
            sinon
                .stub(stripe.paymentMethods, 'retrieve')
                .withArgs(CREATE_STRIPE_INTENT_RESPONSE.payment_method)
                .returns({
                    card: {
                        last4: 1234,
                        brand: 'Visa',
                    },
                    id: 42,
                });
            const payload = {
                store,
                serviceOrderId: serviceOrder.id,
                storeCustomerId: storeCustomer.id,
                centsCustomerId: centsCustomer.id,
                paymentMethodToken: isPartner ? paymentMethodToken : null,
            };

            if (createDuplicatePayment) {
                await factory.create(FN.payment, {
                    status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
                    customerId: null,
                    orderId: order.id,
                    storeCustomerId: storeCustomer.id,
                    storeId: store.id,
                    totalAmount: Number(amount),
                    transactionFee: applicationFee,
                    appliedAmount: Number(amount),
                    unappliedAmount: 0,
                });
                sinon
                    .stub(StripePayment.prototype, 'cancelPaymentIntent')
                    .callsFake(() => CANCEL_STRIPE_INTENT_RESPONSE);
            }
            const response = await ChaiHttpRequestHelper.post(apiEndpoint, {}, payload);
            return {
                response,
                entities: {
                    stripePaidAmount: amount / 100,
                    store,
                    centsCustomer,
                    storeCustomer,
                    partnerSubsidiaryPaymentMethod,
                    serviceOrder,
                },
            };
        };

        const defaultAssert = (response) => {
            const {
                body: { output },
            } = response;
            response.should.have.status(200);
            expect(output).to.have.property('store');
            expect(output).to.have.property('stripePaymentIntent');
            expect(output).to.have.property('serviceOrderId');
            expect(output).to.have.property('storeCustomerId');
            expect(output).to.have.property('centsCustomerId');
            expect(output).to.have.property('paymentMethodToken');
            expect(output).to.have.property('business');
            expect(output).to.have.property('serviceOrder');
            expect(output).to.have.property('order');
            expect(output).to.have.property('storeCustomer');
            expect(output).to.have.property('customer');
            expect(output).to.have.property('paymentModel');
        };

        describe('should return correct response', async () => {
            it('for partnerCustomer', async () => {
                const {
                    response,
                    entities: {
                        partnerSubsidiaryPaymentMethod: { partnerStripeCustomerId },
                    },
                } = await makeRequest({ isPartner: true, isFullPaid: true });
                defaultAssert(response);
                expect(response.body.output.stripePaymentIntent.customer).equals(
                    partnerStripeCustomerId,
                );
            });

            it('for centsCustomer', async () => {
                const {
                    response,
                    entities: { centsCustomer },
                } = await makeRequest({ isPartner: false, isFullPaid: true });
                defaultAssert(response);
                expect(response.body.output.stripePaymentIntent.customer).equals(
                    centsCustomer.stripeCustomerId,
                );
            });

            it('for a fully paid order', async () => {
                const {
                    response,
                    entities: { stripePaidAmount },
                } = await makeRequest({ isPartner: false, isFullPaid: true });
                defaultAssert(response);
                expect(
                    response.body.output.serviceOrder.balanceDue,
                    'with correct balanceDue',
                ).equals(0);
                expect(
                    response.body.output.serviceOrder.paymentStatus,
                    'with correct paymentStatus',
                ).equals(paymentStatuses.PAID);
                expect(
                    response.body.output.paymentModel.appliedAmount,
                    'with correct paymentModel',
                ).equals(stripePaidAmount);
            });

            it('for a not fully paid order', async () => {
                const {
                    response,
                    entities: { serviceOrder, stripePaidAmount },
                } = await makeRequest({ isPartner: false, isFullPaid: false });
                defaultAssert(response);
                expect(
                    response.body.output.serviceOrder.balanceDue,
                    'with correct balanceDue',
                ).equals(serviceOrder.netOrderTotal - stripePaidAmount);
                expect(
                    response.body.output.serviceOrder.paymentStatus,
                    'with correct paymentStatus',
                ).equals(paymentStatuses.BALANCE_DUE);
                expect(
                    response.body.output.paymentModel.appliedAmount,
                    'with correct paymentModel',
                ).equals(stripePaidAmount);
            });

            it('and delete duplicate payment', async () => {
                const {
                    response,
                    entities: { serviceOrder },
                } = await makeRequest({
                    isPartner: true,
                    isFullPaid: true,
                    createDuplicatePayment: true,
                });
                const serviceOrderQuery = new ServiceOrderQuery(serviceOrder.id);
                const payments = await serviceOrderQuery.fetchPayments();
                defaultAssert(response);
                expect(payments, 'should cancel duplicate payment').to.satisfy((payments) =>
                    payments.every(
                        (payment) =>
                            payment.status !== PAYMENT_INTENT_STATUSES.requiresConfirmation,
                    ),
                );
            });
        });
    });
});
