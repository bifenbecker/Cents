require('../../testHelper');
const faker = require('faker');
const factory = require('../../factories');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const { expect } = require('../../support/chaiHelper');
const {
    endpointPipelineMock,
    endpointPipelineErrorMock,
} = require('../../support/pipelineTestHelper');
const {
    createOrderAndCustomerTokens,
    createOrderAndCustomerTokensWithRelations,
} = require('../../support/createOrderAndCustomerTokensHelper');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const endpointName = 'live-status/order-deliveries';
const apiEndpoint = `/api/v1/${endpointName}`;

const makeRequest = async ({ orderToken, customerToken }) => {
    const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
        token: orderToken,
    }).set({
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
                } = await createOrderAndCustomerTokensWithRelations();

                const mockedResult = await endpointPipelineMock({
                    method: 'get',
                    apiEndpoint,
                    params: {
                        token: orderToken,
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
                } = await createOrderAndCustomerTokensWithRelations();

                response = await endpointPipelineErrorMock({
                    method: 'get',
                    apiEndpoint,
                    params: {
                        token: orderToken,
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
            const store = await factory.create(FN.store);
            const route = await factory.create(FN.route);
            const centsCustomer = await factory.create(FN.centsCustomer);
            const storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                status: 'READY_FOR_PROCESSING',
                storeCustomerId: storeCustomer.id,
                netOrderTotal: faker.finance.amount(),
            });
            const order = await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });

            const pickupOrderDelivery = await factory.create(FN.orderDelivery, {
                orderId: order.id,
                storeCustomerId: storeCustomer.id,
                storeId: store.id,
                type: 'PICKUP',
            });

            const deliveryOrderDelivery = await factory.create(FN.orderDelivery, {
                orderId: order.id,
                storeCustomerId: storeCustomer.id,
                storeId: store.id,
                type: 'RETURN',
            });

            const pickupRouteDelivery = await factory.create(FN.routeDelivery, {
                routeId: route.id,
                routableId: pickupOrderDelivery.id,
                routableType: 'OrderDelivery',
                notes: 'test notes',
                imageUrl: 'testUrl',
            });

            const deliveryRouteDelivery = await factory.create(FN.routeDelivery, {
                routeId: route.id,
                routableId: deliveryOrderDelivery.id,
                routableType: 'OrderDelivery',
                notes: 'test notes',
                imageUrl: 'testUrl',
            });

            const { customerToken, orderToken } = await createOrderAndCustomerTokens(
                serviceOrder.id,
                centsCustomer.id,
            );

            const response = await makeRequest({
                customerToken,
                orderToken,
            });

            response.should.have.status(200);
            const { delivery, pickup } = response.body;

            expect(response.body).to.have.property('success').to.be.true;
            expect(response.body).to.have.property('delivery').to.not.be.empty;
            expect(response.body).to.have.property('pickup').to.not.be.empty;

            //delivery asserts
            expect(delivery)
                .to.have.property('customerEmail')
                .to.be.equal(deliveryOrderDelivery.customerEmail);
            expect(delivery)
                .to.have.property('customerName')
                .to.be.equal(deliveryOrderDelivery.customerName);
            expect(delivery)
                .to.have.property('deliveryProvider')
                .to.be.equal(deliveryOrderDelivery.deliveryProvider);
            expect(delivery).to.have.property('type').to.be.equal(deliveryOrderDelivery.type);

            const responseDeliveryRouteDelivery = delivery.routeDelivery;
            expect(delivery).to.have.property('routeDelivery').to.not.be.empty;
            expect(responseDeliveryRouteDelivery)
                .to.have.property('status')
                .to.be.equal(deliveryRouteDelivery.status);
            expect(responseDeliveryRouteDelivery).to.have.property('completedAt').to.be.null;

            //pickup asserts
            expect(pickup)
                .to.have.property('customerEmail')
                .to.be.equal(pickupOrderDelivery.customerEmail);
            expect(pickup)
                .to.have.property('customerName')
                .to.be.equal(pickupOrderDelivery.customerName);
            expect(pickup)
                .to.have.property('deliveryProvider')
                .to.be.equal(pickupOrderDelivery.deliveryProvider);
            expect(pickup).to.have.property('type').to.be.equal(pickupOrderDelivery.type);

            const responsePickupRouteDelivery = delivery.routeDelivery;
            expect(pickup).to.have.property('routeDelivery').to.not.be.empty;
            expect(responsePickupRouteDelivery)
                .to.have.property('status')
                .to.be.equal(pickupRouteDelivery.status);
            expect(responsePickupRouteDelivery).to.have.property('completedAt').to.be.null;
        });

        it('should return empty objects in response', async () => {
            const store = await factory.create(FN.store);
            const centsCustomer = await factory.create(FN.centsCustomer);
            const storeCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                centsCustomerId: centsCustomer.id,
            });
            const serviceOrder = await factory.create(FN.serviceOrder, {
                storeId: store.id,
                status: 'READY_FOR_PROCESSING',
                storeCustomerId: storeCustomer.id,
                netOrderTotal: faker.finance.amount(),
            });
            await factory.create(FN.order, {
                orderableId: serviceOrder.id,
                orderableType: 'ServiceOrder',
            });

            const { customerToken, orderToken } = await createOrderAndCustomerTokens(
                serviceOrder.id,
                centsCustomer.id,
            );

            const response = await makeRequest({
                customerToken,
                orderToken,
            });

            response.should.have.status(200);
            expect(response.body).to.have.property('success').to.be.true;
            expect(response.body).to.have.property('delivery').to.be.eql({});
            expect(response.body).to.have.property('pickup').to.be.eql({});
        });
    });
});
