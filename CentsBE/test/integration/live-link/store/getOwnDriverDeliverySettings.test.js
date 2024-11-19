require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const {
    createOrderAndCustomerTokensWithRelations
} = require('../../../support/createOrderAndCustomerTokensHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../../support/pipelineTestHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    ORDER_DELIVERY_TYPES,
    orderDeliveryStatuses
} = require('../../../../constants/constants');

const endpointName = 'live-status/stores/:storeId/own-driver-delivery-settings';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const makeRequest = async () => {
        const {
            tokens: { customerToken },
            environment: { store, order },
        } = await createOrderAndCustomerTokensWithRelations();

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: orderDeliveryStatuses.SCHEDULED,
        });

        const testApiEndpoint = apiEndpoint.replace(':storeId', store.id);

        return {
            store,
            customerToken,
            testApiEndpoint
        }
    };

    describe('with mocked Pipeline stages', () => {
        let response;

        describe('that running successful', () => {
            let stubbedPipelineRun;

            beforeEach(async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                const mock = await endpointPipelineMock({
                    method: 'get',
                    apiEndpoint: testApiEndpoint,
                    params: {
                        storeId: store.id,
                        zipCode: store.zipCode
                    },
                    headers: { customerauthtoken: customerToken },
                });
                stubbedPipelineRun = mock.stubbedPipelineRun;
                response = mock.response;
            });

            it('Pipeline run should be called and return correct response', () => {
                expect(stubbedPipelineRun.called).to.be.true;
            });
        });

        describe('that running with error', () => {
            beforeEach(async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                response = await endpointPipelineErrorMock({
                    method: 'get',
                    apiEndpoint: testApiEndpoint,
                    headers: { customerauthtoken: customerToken },
                    params: {
                        storeId: store.id,
                        zipCode: store.zipCode
                    },
                })
            });
            it('Pipeline should catch Error', async () => {
                response.should.have.status(500);
                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('with full pipeline stages', async () => {
        describe('should return correct response', async () => {
            let response, params;

            it('should return correct response status and body when ownDeliverySetting is not active', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                await factory.create(FN.ownDeliverySetting, {
                    storeId: store.id,
                    active: false,
                    hasZones: true,
                });

                params = {
                    storeId: store.id,
                    zipCode: store.zipCode
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { ownDriverDeliverySettings },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('ownDriverDeliverySettings');
                expect(ownDriverDeliverySettings).to.have.property('id');
                expect(ownDriverDeliverySettings).to.have.property('active').to.equal(false);
                expect(ownDriverDeliverySettings).to.have.property('storeId');
                expect(ownDriverDeliverySettings).to.have.property('deliveryFeeInCents').to.be.equal(0);
                expect(ownDriverDeliverySettings).to.have.property('returnDeliveryFeeInCents').to.be.equal(null);
                expect(ownDriverDeliverySettings).to.have.property('deliveryWindowBufferInHours').to.be.equal(0.5);
            });

            it('should return correct response status and body when ownDeliverySetting is active', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                await factory.create(FN.ownDeliverySetting, {
                    storeId: store.id,
                    active: true,
                    hasZones: true,
                });

                params = {
                    storeId: store.id,
                    zipCode: store.zipCode
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { ownDriverDeliverySettings },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('ownDriverDeliverySettings');
                expect(ownDriverDeliverySettings).to.have.property('id');
                expect(ownDriverDeliverySettings).to.have.property('active').to.equal(false);
                expect(ownDriverDeliverySettings).to.have.property('storeId');
                expect(ownDriverDeliverySettings).to.have.property('deliveryFeeInCents').to.be.equal(0);
                expect(ownDriverDeliverySettings).to.have.property('returnDeliveryFeeInCents').to.be.equal(null);
                expect(ownDriverDeliverySettings).to.have.property('deliveryWindowBufferInHours').to.be.equal(0.5);
            });

            it('should return the response with empty ownDriverDeliverySettings property', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                params = {
                    storeId: store.id,
                    zipCode: store.zipCode
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('ownDriverDeliverySettings').to.be.empty;
            });
        });
    });
});