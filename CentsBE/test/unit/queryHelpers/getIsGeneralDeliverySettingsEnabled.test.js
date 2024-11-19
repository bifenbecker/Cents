require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories')
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const { getIsGeneralDeliverySettingsEnabled } = require('../../../queryHelpers/getIsGeneralDeliverySettingsEnabled');
const StoreSettings = require('../../../models/storeSettings');
const BusinessSettings = require('../../../models/businessSettings');

describe('test getIsGeneralDeliverySettingsEnabled', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create(FN.laundromatBusiness);
        store = await factory.create(FN.store, {
            businessId: business.id,
        });
    });

    describe('with dryCleaningEnabled as FALSE', () => {
        it('should return true if delivery pricing is RETAIL and delivery is enabled', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'RETAIL',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            const service = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                isDeleted: false,
            });
            await factory.create(FN.servicePrice, {
                serviceId: service.id,
                storeId: store.id,
                isFeatured: true,
                isDeliverable: true,
                deletedAt: null,
            });
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return false if delivery pricing is RETAIL but delivery is not enabled', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: false,
                    deliveryPriceType: 'RETAIL',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            const service = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                isDeleted: false,
            });
            const servicePrice = await factory.create(FN.servicePrice, {
                serviceId: service.id,
                storeId: store.id,
                isFeatured: true,
                isDeliverable: true,
                deletedAt: null,
            });
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is RETAIL but turnAroundInHours is null', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'RETAIL',
                    turnAroundInHours: null,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            const service = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                isDeleted: false,
            });
            const servicePrice = await factory.create(FN.servicePrice, {
                serviceId: service.id,
                storeId: store.id,
                isFeatured: true,
                isDeliverable: true,
                deletedAt: null,
            });
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return true if delivery pricing is DELIVERY_TIER and driver settings has no zones', async () => {
            const tier = await factory.create(FN.pricingTier, {
                type: 'DELIVERY',
                businessId: business.id,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                    deliveryTierId: tier.id,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has no zones but no delivery tier is assigned', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                    deliveryTierId: null,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has no zones but no delivery is not enabled', async () => {
            const tier = await factory.create(FN.pricingTier, {
                type: 'DELIVERY',
                businessId: business.id,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: false,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                    deliveryTierId: tier.id,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has no zones but turnAroundInHours is null', async () => {
            const tier = await factory.create(FN.pricingTier, {
                type: 'DELIVERY',
                businessId: business.id,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: null,
                    deliveryTierId: tier.id,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return true if delivery pricing is DELIVERY_TIER and driver settings has zones active with no zones in place', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has zones active with zones in place', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            await factory.create(FN.zone, {
                ownDeliverySettingsId: ownDriverSettings.id,
                deliveryTierId: null,
            })
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has zones active with no zones in place but delivery is not enabled', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: false,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has zones active with no zones in place but turnAroundInHours is null', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: null,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });
    });

    describe('with dryCleaningEnabled as TRUE', () => {
        beforeEach(async () => {
            await BusinessSettings.query()
                .patch({
                    dryCleaningEnabled: true,
                })
                .findOne({ businessId: business.id });
        });

        it('should return true if delivery pricing is RETAIL and delivery is enabled', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'RETAIL',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            const service = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                isDeleted: false,
            });
            await factory.create(FN.servicePrice, {
                serviceId: service.id,
                storeId: store.id,
                isFeatured: true,
                isDeliverable: true,
                deletedAt: null,
            });
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return false if delivery pricing is RETAIL but delivery is not enabled', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: false,
                    deliveryPriceType: 'RETAIL',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            const service = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                isDeleted: false,
            });
            await factory.create(FN.servicePrice, {
                serviceId: service.id,
                storeId: store.id,
                isFeatured: true,
                isDeliverable: true,
                deletedAt: null,
            });
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return true if delivery pricing is RETAIL but turnAroundInHours is null', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'RETAIL',
                    turnAroundInHours: null,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const serviceCategory = await factory.create(FN.serviceCategory, {
                businessId: business.id,
            });
            const service = await factory.create(FN.serviceMaster, {
                serviceCategoryId: serviceCategory.id,
                isDeleted: false,
            });
            await factory.create(FN.servicePrice, {
                serviceId: service.id,
                storeId: store.id,
                isFeatured: true,
                isDeliverable: true,
                deletedAt: null,
            });
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return true if delivery pricing is DELIVERY_TIER and driver settings has no zones', async () => {
            const tier = await factory.create(FN.pricingTier, {
                type: 'DELIVERY',
                businessId: business.id,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                    deliveryTierId: tier.id,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has no zones but no delivery tier is assigned', async () => {
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                    deliveryTierId: null,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has no zones but no delivery is not enabled', async () => {
            const tier = await factory.create(FN.pricingTier, {
                type: 'DELIVERY',
                businessId: business.id,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: false,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                    deliveryTierId: tier.id,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return true if delivery pricing is DELIVERY_TIER and driver settings has no zones but turnAroundInHours is null', async () => {
            const tier = await factory.create(FN.pricingTier, {
                type: 'DELIVERY',
                businessId: business.id,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: null,
                    deliveryTierId: tier.id,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return true if delivery pricing is DELIVERY_TIER and driver settings has zones active with no zones in place', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has zones active with zones in place', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            await factory.create(FN.zone, {
                ownDeliverySettingsId: ownDriverSettings.id,
                deliveryTierId: null,
            })
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has zones active with no zones in place but delivery is not enabled', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: false,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: 24,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });

        it('should return false if delivery pricing is DELIVERY_TIER and driver settings has zones active with no zones in place but turnAroundInHours is null', async () => {
            const ownDriverSettings = await factory.create(FN.ownDeliverySetting, {
                storeId: store.id,
                hasZones: true,
            });
            const storeSettings = await StoreSettings.query()
                .patch({
                    deliveryEnabled: true,
                    deliveryPriceType: 'DELIVERY_TIER',
                    turnAroundInHours: null,
                })
                .findOne({ storeId: store.id })
                .returning('*');
            const payload = {
                storeSettings,
                driverSettings: ownDriverSettings,
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.true;
        });
    });

    describe('when storeSettings is empty', () => {
        it('should return false if store settings is empty', async () => {
            const payload = {
                storeSettings: {},
                driverSettings: {},
            };
            const result = await getIsGeneralDeliverySettingsEnabled(payload);
            expect(result).to.be.false;
        });
    });
});
