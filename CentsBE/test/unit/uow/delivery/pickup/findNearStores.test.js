require('../../../../testHelper');
const { cloneDeep } = require('lodash');
const { expect, assert } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const findNearStores = require('../../../../../uow/delivery/pickup/findNearStores');
const StoreSettings = require('../../../../../models/storeSettings');
const BusinessSettings = require('../../../../../models/businessSettings');
const { StoreSchema } = require('../../../../../elasticsearch/store/schema');
const { reindexStoresData } = require('../../../../../elasticsearch/store/reindexData');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const { serviceCategoryTypes } = require('../../../../../constants/constants');

describe('test findNearStores UoW', () => {
    const googlePlacesId = 'googlePlacesId';
    const deliveryWindowBufferInHours = 0.5;
    const zipCode = '10001';
    const lat = '40.787621';
    const lng = '-73.996193';
    const deliveryKeys = [
        'id',
        'businessId',
        'name',
        'uberStoreUuid',
        'state',
        'type',
        'googlePlacesId',
        'turnAroundInHours',
        'hasZones',
        'zipCodes',
        'deliveryEnabled',
        'recurringDiscountInPercent',
        'autoScheduleReturnEnabled',
        'customLiveLinkHeader',
        'customLiveLinkMessage',
        'offersOwnDelivery',
        'deliveryFeeInCents',
        'returnDeliveryFeeInCents',
        'offersCentsDelivery',
        'doorDashEnabled',
        'subsidyInCents',
        'returnOnlySubsidyInCents',
        'pin',
        'distance',
    ];

    beforeEach(async () => {
        await StoreSchema();
    });

    describe('should return correct payload', () => {
        it('when store is ownDeliveryStore', async () => {
            const business = await factory.create(FN.laundromatBusiness);
            const store = await factory.create(FN.store, {
                businessId: business.id,
            });
            await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                active: true,
                zipCodes: [zipCode],
                deliveryFeeInCents: 0,
                returnDeliveryFeeInCents: null,
                deliveryWindowBufferInHours,
            });
            await StoreSettings.query().patch({
                lat,
                lng,
                googlePlacesId,
                customLiveLinkHeader: null,
                deliveryEnabled: true,
            });
            await reindexStoresData();
            const payload = {
                businessId: business.id,
                zipCode,
                lat,
                lng,
            };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const newPayload = await findNearStores(payload);

            // assert
            assert.deepInclude(newPayload, initialPayload, 'should include initial payload');
            expect(newPayload).have.property('ownDeliveryStore').have.keys(deliveryKeys);
            expect(newPayload).have.property('onDemandDeliveryStore').to.be.an('object').to.be
                .empty;
        });

        it('when store is onDemandDeliveryStore', async () => {
            const business = await factory.create(FN.laundromatBusiness);
            const store = await factory.create(FN.store, {
                businessId: business.id,
            });
            await StoreSettings.query().patch({
                lat,
                lng,
                googlePlacesId,
                customLiveLinkHeader: null,
                deliveryEnabled: true,
            });
            await factory.create(FN.centsDeliverySettings, {
                storeId: store.id,
                active: true,
                subsidyInCents: 0,
                returnOnlySubsidyInCents: 0,
                doorDashEnabled: false,
            });
            await reindexStoresData();
            const payload = {
                businessId: business.id,
                zipCode,
                lat,
                lng,
            };
            const initialPayload = cloneDeep(payload);

            // call UoW
            const newPayload = await findNearStores(payload);

            // assert
            assert.deepInclude(newPayload, initialPayload, 'should include initial payload');
            expect(newPayload).have.property('onDemandDeliveryStore').have.keys(deliveryKeys);
            expect(newPayload).have.property('ownDeliveryStore').to.be.an('object').to.be.empty;
        });

        describe('with Cents 2.0', () => {
            const storeSettingsTurnAround = 48;
            const laundryCategoryTurnAround = 24;
            let business;
            let store;

            beforeEach(async () => {
                business = await factory.create(FN.laundromatBusiness);
                store = await factory.create(FN.store, {
                    businessId: business.id,
                });

                const serviceCategoryType = await factory.create(FN.serviceCategoryType, {
                    type: serviceCategoryTypes.LAUNDRY,
                });

                await factory.create(FN.serviceCategory, {
                    businessId: business.id,
                    serviceCategoryTypeId: serviceCategoryType.id,
                    turnAroundInHours: laundryCategoryTurnAround,
                });
            });

            it('when store is ownDeliveryStore', async () => {
                await BusinessSettings.query()
                    .patch({
                        dryCleaningEnabled: true,
                    })
                    .findOne({ businessId: business.id });
                await StoreSettings.query().patch({
                    lat,
                    lng,
                    googlePlacesId,
                    customLiveLinkHeader: null,
                    deliveryEnabled: true,
                    turnAroundInHours: storeSettingsTurnAround,
                });

                await factory.create(FN.ownDeliverySetting, {
                    storeId: store.id,
                    active: true,
                    zipCodes: [zipCode],
                    deliveryFeeInCents: 0,
                    returnDeliveryFeeInCents: null,
                    deliveryWindowBufferInHours,
                });
                await reindexStoresData();
                const payload = {
                    businessId: business.id,
                    zipCode,
                    lat,
                    lng,
                    apiVersion: '2.0.0',
                };
                const initialPayload = cloneDeep(payload);

                // call UoW
                const newPayload = await findNearStores(payload);

                // assert
                assert.deepInclude(newPayload, initialPayload, 'should include initial payload');
                expect(newPayload).have.property('ownDeliveryStore').have.keys(deliveryKeys);
                expect(newPayload.ownDeliveryStore).have.property(
                    'turnAroundInHours',
                    laundryCategoryTurnAround,
                );

                expect(newPayload).have.property('onDemandDeliveryStore').to.be.an('object').to.be
                    .empty;
            });

            it('when store is onDemand and with Dry Cleaning', async () => {
                const dryCleaningCategoryTurnAround = 72;
                await BusinessSettings.query()
                    .patch({
                        dryCleaningEnabled: true,
                    })
                    .findOne({ businessId: business.id });

                await StoreSettings.query().patch({
                    lat,
                    lng,
                    googlePlacesId,
                    customLiveLinkHeader: null,
                    deliveryEnabled: true,
                    turnAroundInHours: storeSettingsTurnAround,
                    offerDryCleaningForDelivery: true,
                });

                const dryCleaningServiceCategoryType = await factory.create(
                    FN.serviceCategoryType,
                    {
                        type: serviceCategoryTypes.DRY_CLEANING,
                    },
                );

                await factory.create(FN.serviceCategory, {
                    businessId: business.id,
                    serviceCategoryTypeId: dryCleaningServiceCategoryType.id,
                    turnAroundInHours: dryCleaningCategoryTurnAround,
                });

                await factory.create(FN.centsDeliverySettings, {
                    storeId: store.id,
                    active: true,
                    doorDashEnabled: true,
                });
                await reindexStoresData();
                const payload = {
                    businessId: business.id,
                    zipCode,
                    lat,
                    lng,
                    apiVersion: '2.0.0',
                };
                const initialPayload = cloneDeep(payload);

                // call UoW
                const newPayload = await findNearStores(payload);

                // assert
                assert.deepInclude(newPayload, initialPayload, 'should include initial payload');
                expect(newPayload).have.property('ownDeliveryStore').to.be.an('object').to.be.empty;
                expect(newPayload).have.property('onDemandDeliveryStore').to.be.an('object');
                expect(newPayload.onDemandDeliveryStore).have.property(
                    'turnAroundInHours',
                    dryCleaningCategoryTurnAround,
                );
            });
        });
    });

    describe('should throw', () => {
        it('Error, when store is not exist', async () => {
            await factory.create(FN.store);
            await reindexStoresData();
            const payload = {
                businessId: 999999,
                zipCode,
                lat,
                lng,
            };
            await expect(findNearStores(payload)).to.be.rejectedWith('STORES_NOT_AVAILABLE');
        });

        it('unprovided Error', async () => {
            await expect(findNearStores()).to.be.rejected;
        });
    });
});
