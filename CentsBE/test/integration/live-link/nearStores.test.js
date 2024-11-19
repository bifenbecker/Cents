require('../../testHelper');
const sinon = require('sinon');
const nock = require('nock');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');
const ChaiHttpRequestHelper = require('../../support/chaiHttpRequestHelper');
const {
    createUserWithBusinessAndCustomerOrders,
} = require('../../support/factoryCreators/createUserWithBusinessAndCustomerOrders');
const JwtService = require('../../../services/tokenOperations/main');
const { reindexStoresData } = require('../../../elasticsearch/store/reindexData');
const { StoreSchema } = require('../../../elasticsearch/store/schema');
const StoreSettings = require('../../../models/storeSettings');
const Pipeline = require('../../../pipeline/pipeline');
const { shiftType, envVariables } = require('../../../constants/constants');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');

const apiEndpoint = `/api/v1/live-status/near-stores`;
describe(`test ${apiEndpoint} API endpoint`, () => {
    afterEach(() => {
        nock.cleanAll();
    });

    describe('should return correct response', async () => {
        const day = 1;
        const googlePlacesId = 'googlePlacesId';
        const deliveryWindowBufferInHours = 0.5;
        const turnAroundInHours = 24;
        const zipCode = '10001';
        const lat = '40.787621';
        const lng = '-73.996193';
        const timeZone = 'America/Los_Angeles';
        const params = {
            place_id: googlePlacesId,
            fields: 'formatted_address,address_component',
            key: process.env.GOOGLE_PLACES_API_KEY,
        };
        let pipelineSpy;
        let entities;
        let customerauthtoken;
        let googlePlaceApi;
        let doorDashApi;

        const defaultAssert = (response) => {
            const { store, servicePrice, serviceMaster } = entities;
            expect(pipelineSpy.called, 'should call pipeline').to.be.true;
            expect(response.statusCode).equals(200);
            expect(response.body).should.not.be.empty;
            expect(response.body).to.have.property('success', true);
            expect(response.body)
                .to.have.property('recentCompletedStandardOrder')
                .have.property('clone')
                .have.property('storeId', store.id);
            expect(response.body.recentCompletedStandardOrder.clone).have.property(
                'servicePriceId',
                servicePrice.id,
            );
            expect(response.body.recentCompletedStandardOrder.clone)
                .have.property('address')
                .have.property('id');
            expect(response.body.recentCompletedStandardOrder.clone).have.property('orderDelivery');
            expect(response.body)
                .to.have.property('recentCompletedStandardOrder')
                .have.property('details')
                .have.property('id', serviceMaster.id);
        };

        beforeEach(async () => {
            await StoreSchema();
            pipelineSpy = sinon.spy(Pipeline.prototype, 'run');
            entities = await createUserWithBusinessAndCustomerOrders(
                {},
                {
                    serviceOrder: {
                        status: 'COMPLETED',
                        orderType: 'ONLINE',
                    },
                },
            );
            await StoreSettings.query().patch({
                lat,
                lng,
                googlePlacesId,
                customLiveLinkHeader: null,
                deliveryEnabled: true,
                turnAroundInHours,
            });
            await factory.create(FN.orderDelivery, {
                orderId: entities.order.id,
                type: 'PICKUP',
                status: 'COMPLETED',
                postalCode: zipCode,
            });
            const orderItem = await factory.create(FN.serviceOrderItem, {
                orderId: entities.serviceOrder.id,
                customerSelection: true,
            });
            const servicePricingStructure = await factory.create(FN.servicePricingStructure);
            const serviceMaster = await factory.create(FN.serviceMaster, {
                isDeleted: false,
                servicePricingStructureId: servicePricingStructure.id,
            });
            entities.serviceMaster = serviceMaster;
            const servicePrice = await factory.create(FN.servicePrice, {
                storeId: entities.store.id,
                serviceId: serviceMaster.id,
                isDeliverable: true,
                isFeatured: true,
            });
            entities.servicePrice = servicePrice;
            await factory.create(FN.serviceReferenceItem, {
                orderItemId: orderItem.id,
                servicePriceId: servicePrice.id,
            });

            const jwtService = new JwtService(JSON.stringify(entities.centsCustomer));
            customerauthtoken = jwtService.tokenGenerator(
                process.env.JWT_SECRET_LIVE_LINK_CUSTOMER,
            );

            googlePlaceApi = nock(envVariables.GOOGLE_PLACES_DETAILS_URL)
                .get('')
                .query(params)
                .reply(200, { result: { formatted_address: '111 8th Avenue, New York, NY' } });
            const doorDashResponse = { estimate: 'doorDashEstimate' };
            doorDashApi = nock(process.env.DOORDASH_API_URL)
                .post('/estimates')
                .reply(200, doorDashResponse);
        });

        it('with own delivery', async () => {
            const { store } = entities;

            await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                active: true,
                zipCodes: [zipCode],
                hasZones: false,
                deliveryFeeInCents: 0,
                returnDeliveryFeeInCents: null,
                deliveryWindowBufferInHours,
            });
            const ownDriverShift = await factory.create(FN.shift, {
                storeId: store.id,
                type: shiftType.OWN_DELIVERY,
            });
            const ownDriverTiming = await factory.create(FN.timing, {
                shiftId: ownDriverShift.id,
                day,
            });
            await factory.create(FN.deliveryTimingSetting, {
                timingsId: ownDriverTiming.id,
                maxStops: 5,
            });
            await reindexStoresData();

            // call
            const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                businessId: store.businessId,
                googlePlacesId,
                timeZone,
                lat,
                lng,
                zipCode,
            }).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response);
            expect(response.body).to.have.property('onDemandDeliveryStore').to.be.an('object').to.be
                .empty;
            expect(response.body)
                .to.have.property('ownDeliveryStore')
                .deep.equals({
                    onDemandDeliverySettings: { doorDashEnabled: null },
                    ownDeliverySettings: { deliveryWindowBufferInHours },
                    storeId: store.id,
                    state: store.state,
                    storeName: store.name,
                    deliveryFeeInCents: 0,
                    turnAroundInHours,
                    recurringDiscountInPercent: 0,
                    autoScheduleReturnEnabled: false,
                });
            expect(googlePlaceApi.isDone(), 'should call Google Place API').to.be.true;
            expect(doorDashApi.isDone(), 'should call DoorDash API').to.be.false;
        });

        it('with on demand delivery', async () => {
            const { store } = entities;
            const subsidyInCents = 200;
            const returnOnlySubsidyInCents = 150;
            const centsDeliverySettings = await factory.create(FN.centsDeliverySettings, {
                storeId: store.id,
                active: true,
                subsidyInCents,
                returnOnlySubsidyInCents,
                doorDashEnabled: true,
            });
            const onDemandShift = await factory.create(FN.shift, {
                storeId: store.id,
                type: shiftType.CENTS_DELIVERY,
            });
            const onDemandTiming = await factory.create(FN.timing, {
                shiftId: onDemandShift.id,
                day,
            });
            await reindexStoresData();

            // call
            const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                businessId: store.businessId,
                googlePlacesId,
                timeZone,
                lat,
                lng,
                zipCode,
            }).set({
                customerauthtoken,
            });

            // assert
            defaultAssert(response);
            expect(response.body).to.have.property('ownDeliveryStore').deep.equals({
                onDemandDeliverySettings: {},
            });
            expect(response.body).to.have.property('onDemandDeliveryStore');
            const { dayWiseWindows, ...onDemandWithoutWindows } =
                response.body.onDemandDeliveryStore;
            expect(onDemandWithoutWindows).deep.equals({
                storeId: store.id,
                state: store.state,
                storeName: store.name,
                subsidyInCents,
                returnOnlySubsidyInCents,
                turnAroundInHours,
                recurringDiscountInPercent: 0,
                doorDashEnabled: centsDeliverySettings.doorDashEnabled,
            });
            expect(dayWiseWindows[day]).have.property('timings').to.be.an('array').not.be.empty;
            expect(dayWiseWindows[day].timings[0]).have.property('id', onDemandTiming.id);
            expect(
                dayWiseWindows
                    .filter((window) => window.day !== day)
                    .every((window) => window.timings.length === 0),
                'all windows except the created one should be empty',
            ).to.be.true;
            expect(googlePlaceApi.isDone(), 'should call Google Place API').to.be.true;
            expect(doorDashApi.isDone(), 'should call DoorDash API').to.be.true;
        });

        describe('on Error', () => {
            it('if STORES_NOT_AVAILABLE', async () => {
                sinon.restore();
                sinon
                    .stub(Pipeline.prototype, 'run')
                    .returns({ ownDeliveryStore: {}, onDemandDeliveryStore: {} });

                // call
                const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                    businessId: entities.store.businessId,
                    googlePlacesId,
                    timeZone,
                    lat,
                    lng,
                    zipCode,
                }).set({
                    customerauthtoken,
                });

                // assert
                expect(response.statusCode).equals(200);
                expect(response.body).should.not.be.empty;
                expect(response.body).to.have.property('ownDeliveryStore').to.be.an('object').to.be
                    .empty;
                expect(response.body).to.have.property('onDemandDeliveryStore').to.be.an('object')
                    .to.be.empty;
                expect(response.body)
                    .to.have.property('recentCompletedStandardOrder')
                    .to.be.an('object').to.be.empty;
            });

            it('if Error is unprovided', async () => {
                const errorMsg = 'Pipeline error!';
                const error = new Error(errorMsg);
                sinon.stub(Pipeline.prototype, 'startTransaction').throws(error);
                sinon.stub(Pipeline.prototype, 'rollbackTransaction');

                // call
                const response = await ChaiHttpRequestHelper.get(apiEndpoint, {
                    businessId: 999999,
                    googlePlacesId,
                    timeZone,
                    lat,
                    lng,
                    zipCode,
                }).set({
                    customerauthtoken,
                });

                // assert
                expect(response.statusCode).equals(500);
                expect(response.body).should.not.be.empty;
                expect(response.body).to.have.property('error', errorMsg);
            });
        });
    });
});
