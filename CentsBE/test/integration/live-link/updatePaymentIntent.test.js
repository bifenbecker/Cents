require('../../testHelper');
const sinon = require('sinon');
const stripe = require('../../../stripe/stripeWithSecret');
const factory = require('../../factories');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { expect } = require('../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../support/pipelineTestHelper');
const {
    createOrderAndCustomerTokensWithRelations,
} = require('../../support/createOrderAndCustomerTokensHelper');
const { CREATE_STRIPE_INTENT_RESPONSE } = require('../../constants/responseMocks');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { PAYMENT_INTENT_STATUSES } = require('../../constants/statuses');

const endpointName = 'live-status/payment-method';
const apiEndpoint = `/api/v1/${endpointName}`;

const makeRequest = async ({ orderToken, customerToken, body }) => {
    const response = await ChaiHttpRequestHelper.put(
        apiEndpoint,
        {
            token: orderToken,
        },
        body,
    ).set({
        customerauthtoken: customerToken,
    });

    return response;
};

describe(`test ${endpointName} API`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            let stubbedPipelineRun;
            let response;

            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order },
                } = await createOrderAndCustomerTokensWithRelations();

                const cashPayment = await factory.create(FN.payment, {
                    storeId: store.id,
                    orderId: order.id,
                    paymentProcessor: 'stripe',
                });

                const mockedResult = await endpointPipelineMock({
                    method: 'put',
                    apiEndpoint,
                    params: {
                        token: orderToken,
                    },
                    body: {
                        paymentToken: cashPayment.paymentToken,
                    },
                    headers: {
                        customerauthtoken: customerToken,
                    },
                });
                stubbedPipelineRun = mockedResult.stubbedPipelineRun;
                response = mockedResult.response;
            });

            it('Pipeline run should be called', () => {
                expect(stubbedPipelineRun.called).to.be.true;
            });
        });

        describe('that running with error', () => {
            let response;

            beforeEach(async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { store, order },
                } = await createOrderAndCustomerTokensWithRelations();

                const cashPayment = await factory.create(FN.payment, {
                    storeId: store.id,
                    orderId: order.id,
                    paymentProcessor: 'stripe',
                });

                response = await endpointPipelineErrorMock({
                    method: 'put',
                    apiEndpoint,
                    params: {
                        token: orderToken,
                    },
                    body: {
                        paymentToken: cashPayment.paymentToken,
                    },
                    headers: {
                        customerauthtoken: customerToken,
                    },
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

    describe('integration tests with full pipeline stages', () => {
        it('should return correct response when relations are valid', async () => {
            const {
                tokens: { customerToken, orderToken },
                environment: { serviceOrder, order, store },
            } = await createOrderAndCustomerTokensWithRelations();

            await factory.create(FN.payment, {
                orderId: order.id,
                serviceOrderId: serviceOrder.id,
                storeId: store.id,
                status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
                totalAmount: serviceOrder.netOrderTotal,
                appliedAmount: serviceOrder.netOrderTotal,
                paymentProcessor: 'stripe',
                createdAt: new Date('4-5-2022').toISOString(),
            });
            const spyRetrieve = sinon
                .stub(stripe.paymentIntents, 'retrieve')
                .callsFake(() => CREATE_STRIPE_INTENT_RESPONSE);
            const spyUpdate = sinon.stub(stripe.paymentIntents, 'update').callsFake(() => {});
            
            const response = await makeRequest({
                customerToken,
                orderToken,
                body: {
                    paymentToken: 'test token',
                },
            });
            response.should.have.status(200);
            expect(response.body).to.have.property('success').to.be.true;
            sinon.assert.calledOnce(spyRetrieve);
            sinon.assert.calledOnce(spyUpdate);
        });
    });

    it('should not call retrieve and update stripe methods when there are no any payments and return status 200', async () => {
        const {
            tokens: { customerToken, orderToken },
        } = await createOrderAndCustomerTokensWithRelations();

        const spyRetrieve = sinon.spy(stripe.paymentIntents, 'retrieve');
        const spyUpdate = sinon.spy(stripe.paymentIntents, 'update');

        const response = await makeRequest({
            customerToken,
            orderToken,
            body: {
                paymentToken: 'test token',
            },
        });

        response.should.have.status(200);
        expect(response.body).to.have.property('success').to.be.true;

        sinon.assert.notCalled(spyRetrieve);
        sinon.assert.notCalled(spyUpdate);
    });

    it('should return response with status 404 when stripe returns not_found answer', async () => {
        const {
            tokens: { customerToken, orderToken },
            environment: { serviceOrder, order, store },
        } = await createOrderAndCustomerTokensWithRelations();

        await factory.create(FN.payment, {
            orderId: order.id,
            serviceOrderId: serviceOrder.id,
            storeId: store.id,
            status: PAYMENT_INTENT_STATUSES.requiresConfirmation,
            totalAmount: serviceOrder.netOrderTotal,
            appliedAmount: serviceOrder.netOrderTotal,
            paymentProcessor: 'stripe',
            createdAt: new Date('4-5-2022').toISOString(),
        });

        sinon.stub(stripe.paymentIntents, 'retrieve').throws(new Error('not_found'));

        const response = await makeRequest({
            customerToken,
            orderToken,
            body: {
                paymentToken: 'test token',
            },
        });

        response.should.have.status(404);
        expect(response.body)
            .to.have.property('error')
            .to.be.equal('payment which requires confirmation is not found');
    });
});
