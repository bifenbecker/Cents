require('../../testHelper');
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
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/order-delivery/:orderDeliveryId/route-details';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    describe('with mocked Pipeline stages', () => {
        describe('that running successful', () => {
            it('should return correct response', async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { orderDelivery },
                } = await createOrderAndCustomerTokensWithRelations();

                const testApiEndpoint = apiEndpoint.replace(':orderDeliveryId', orderDelivery.id);

                const mockedResult = await endpointPipelineMock({
                    method: 'get',
                    apiEndpoint: testApiEndpoint,
                    params: {
                        token: orderToken,
                    },
                    headers: {
                        customerauthtoken: customerToken,
                    },
                    pipelineReturn: {
                        id: orderDelivery.id,
                    },
                });

                const { stubbedPipelineRun, response } = mockedResult;

                expect(stubbedPipelineRun.called, 'pipeline run should be called').to.be.true;
                response.body.should.not.be.empty;
                response.should.have.status(200);
            });
        });

        describe('that running with error', () => {
            it('Pipeline should catch Error', async () => {
                const {
                    tokens: { customerToken, orderToken },
                    environment: { orderDelivery },
                } = await createOrderAndCustomerTokensWithRelations();

                const testApiEndpoint = apiEndpoint.replace(':orderDeliveryId', orderDelivery.id);

                const response = await endpointPipelineErrorMock({
                    method: 'get',
                    apiEndpoint: testApiEndpoint,
                    params: {
                        token: orderToken,
                    },
                    headers: {
                        customerauthtoken: customerToken,
                    },
                });

                response.should.have.status(500);

                expect(response.body).to.eql({
                    error: 'Pipeline error!',
                });
            });
        });
    });

    describe('integration tests with full Pipeline stages', () => {
        const makeRequest = async ({ orderDeliveryId, customerToken, orderToken }) => {
            const testApiEndpoint = apiEndpoint.replace(':orderDeliveryId', orderDeliveryId);
            const response = await ChaiHttpRequestHelper.get(testApiEndpoint, {
                token: orderToken,
            }).set({
                customerauthtoken: customerToken,
            });

            return response;
        };

        it('should return correct response', async () => {
            const {
                tokens: { customerToken, orderToken },
                environment: { orderDelivery },
            } = await createOrderAndCustomerTokensWithRelations();

            const user = await factory.create(FN.user, {
                phone: '333333',
            });
            const driver = await factory.create(FN.teamMember, {
                role: 'Driver',
                userId: user.id,
            });
            const route = await factory.create(FN.route, {
                driverId: driver.id,
            });
            const routeDelivery = await factory.create(FN.routeDelivery, {
                routeId: route.id,
                routableId: orderDelivery.id,
                routableType: 'OrderDelivery',
                notes: 'test notes',
                imageUrl: 'testUrl',
            });

            const response = await makeRequest({
                orderDeliveryId: orderDelivery.id,
                customerToken,
                orderToken,
            });

            response.should.have.status(200);
            expect(response.body).to.have.property('success').to.be.true;
            expect(response.body)
                .to.have.property('routeDelivery')
                .to.be.eql({
                    id: routeDelivery.id,
                    status: routeDelivery.status,
                    eta: routeDelivery.eta.toString(),
                    notes: routeDelivery.notes,
                    imageUrl: routeDelivery.imageUrl,
                    route: {
                        id: route.id,
                        status: route.status,
                        driver: {
                            firstName: user.firstname,
                            lastName: user.lastname,
                            phoneNumber: user.phone,
                        },
                    },
                });
        });
        it('should return an empty object when did not find routeDeliveryDetails', async () => {
            const {
                tokens: { customerToken, orderToken },
                environment: { orderDelivery },
            } = await createOrderAndCustomerTokensWithRelations();

            const response = await makeRequest({
                orderDeliveryId: orderDelivery.id,
                customerToken,
                orderToken,
            });

            response.should.have.status(200);
            expect(response.body).to.have.property('success').to.be.true;
            expect(response.body).to.have.property('routeDelivery').to.be.eql({});
        });
    });
});
