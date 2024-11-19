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
const StoreSettings = require('../../../../models/storeSettings');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    ORDER_DELIVERY_TYPES,
    orderDeliveryStatuses,
    pricingTiersTypes
} = require('../../../../constants/constants');

const endpointName = 'live-status/stores/:storeId/own-delivery-windows';
const apiEndpoint = `/api/v1/${endpointName}`;

describe(`test ${apiEndpoint} API endpoint`, () => {
    const makeRequest = async () => {
        const {
            tokens: { customerToken },
            environment: { store, order },
        } = await createOrderAndCustomerTokensWithRelations();

        const ownDeliverySettings = await factory.create(FN.ownDeliverySetting, {
            storeId: store.id,
            active: true,
            hasZones: true,
        });

        await factory.create(FN.orderDelivery, {
            orderId: order.id,
            type: ORDER_DELIVERY_TYPES.PICKUP,
            status: orderDeliveryStatuses.SCHEDULED,
        });

        const shift = await factory.create(FN.shift, {
            storeId: store.id,
            type: 'OWN_DELIVERY'
        });

        await factory.create(FN.timing, {
            shiftId: shift.id,
        });

        const subscription = await factory.create(FN.recurringSubscription);

        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            netOrderTotal: 100,
        });

        await factory.create(FN.serviceOrderRecurringSubscription, {
            recurringSubscriptionId: subscription.id,
            serviceOrderId: serviceOrder.id,
        });

        const deliveryTier = await factory.create(FN.pricingTier, {
            businessId: store.businessId,
            type: pricingTiersTypes.DELIVERY,
        });

        const zone = await factory.create(FN.zone, {
            ownDeliverySettingsId: ownDeliverySettings.id,
            zipCodes: ownDeliverySettings.zipCodes,
            deliveryTierId: deliveryTier.id
        });

        await factory.create(FN.shiftTimingZone, { zoneIds: [zone.id] });

        await StoreSettings.query()
            .where({ processingCapability: 'BASIC' })
            .patch({
                timeZone: 'America/Los_Angeles',
            })
            .returning('*')

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
                        zipCode: 94555,
                        serviceType: 'TECHNICAL_SERVICE',
                        startDate: new Date().getTime(),
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
                        zipCode: 94555,
                        serviceType: 'TECHNICAL_SERVICE',
                        startDate: new Date().getTime(),
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

            it('should return correct response status and body', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                params = {
                    storeId: store.id,
                    zipCode: 94555,
                    serviceType: 'TECHNICAL_SERVICE',
                    startDate: new Date().getTime(),
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { dayWiseWindows },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('dayWiseWindows');
                expect(dayWiseWindows[0]).to.have.property('current_date');
                expect(dayWiseWindows[0]).to.have.property('current_date_in_unix');
                expect(dayWiseWindows[0]).to.have.property('day');
                expect(dayWiseWindows[0]).to.have.property('timings');
            });

            it('should return correct response status and body without startDate', async () => {
                const { store, customerToken, testApiEndpoint } = await makeRequest();

                params = {
                    storeId: store.id,
                    zipCode: 94555,
                    serviceType: 'TECHNICAL_SERVICE',
                };

                response = await ChaiHttpRequestHelper.get(testApiEndpoint, params)
                    .set('customerauthtoken', customerToken);

                const {
                    body: { dayWiseWindows },
                } = response;

                response.should.have.status(200);
                response.body.should.have.property('success', true);
                response.body.should.have.property('dayWiseWindows');
                expect(dayWiseWindows[0]).to.have.property('current_date');
                expect(dayWiseWindows[0]).to.have.property('current_date_in_unix');
                expect(dayWiseWindows[0]).to.have.property('day');
                expect(dayWiseWindows[0]).to.have.property('timings');
            });
        });
    });
});