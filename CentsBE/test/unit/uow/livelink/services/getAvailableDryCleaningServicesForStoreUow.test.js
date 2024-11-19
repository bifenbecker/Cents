require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');

const StoreSettings = require('../../../../../models/storeSettings');
const getAvailableDryCleaningServicesForStore = require('../../../../../uow/liveLink/services/getAvailableDryCleaningServicesForStoreUow');
const { deliveryPriceTypes, pricingTiersTypes } = require('../../../../../constants/constants');

describe('test getAvailableDryCleaningServicesForStore UoW', () => {
    let dryCleaningCategoryType, business, store, deliveryTier, serviceCategory, dryCleaningService;

    beforeEach(async () => {
        dryCleaningCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType, {
            type: 'DRY_CLEANING',
        });
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        deliveryTier = await factory.create(FACTORIES_NAMES.pricingTier, {
            businessId: business.id,
            type: pricingTiersTypes.DELIVERY,
        });
        serviceCategory = await factory.create(FACTORIES_NAMES.serviceCategory, {
          businessId: business.id,
          serviceCategoryTypeId: dryCleaningCategoryType.id,
          category: 'Zoot Suits',
        });
        dryCleaningService = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
    });

    it('should fetch a list of dry cleaning services if store has delivery tier', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                deliveryTierId: deliveryTier.id,
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const servicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
            storeId: null,
            pricingTierId: deliveryTier.id,
            serviceId: dryCleaningService.id,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await getAvailableDryCleaningServicesForStore(payload);
        const { dryCleaningServices } = uowOutput;

        // assert
        expect(dryCleaningServices).to.exist;
        expect(dryCleaningServices[0].id).to.equal(servicePrice.id);
        expect(dryCleaningServices[0].pricingTierId).to.equal(deliveryTier.id);
        expect(dryCleaningServices[0].storeId).to.be.null;
    });

    it('should fetch an empty list of dry cleaning services if store has delivery tier but no tiered services', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                deliveryTierId: deliveryTier.id,
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        await factory.create(FACTORIES_NAMES.servicePrice, {
            storeId: store.id,
            pricingTierId: null,
            serviceId: dryCleaningService.id,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await getAvailableDryCleaningServicesForStore(payload);
        const { dryCleaningServices } = uowOutput;

        // assert
        expect(dryCleaningServices).to.exist;
        expect(dryCleaningServices.length).to.equal(0);
    });

    it('should fetch a list of dry cleaning services if store has no delivery tier', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                deliveryTierId: null,
                deliveryPriceType: deliveryPriceTypes.RETAIL,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const servicePrice = await factory.create(FACTORIES_NAMES.servicePrice, {
            storeId: store.id,
            pricingTierId: null,
            serviceId: dryCleaningService.id,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await getAvailableDryCleaningServicesForStore(payload);
        const { dryCleaningServices } = uowOutput;

        // assert
        expect(dryCleaningServices).to.exist;
        expect(dryCleaningServices[0].id).to.equal(servicePrice.id);
        expect(dryCleaningServices[0].storeId).to.equal(store.id);
        expect(dryCleaningServices[0].pricingTierId).to.be.null;
    });

    it('should fetch an empty list of dry cleaning services if store has retail pricing but no retail services', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                deliveryTierId: null,
                deliveryPriceType: deliveryPriceTypes.RETAIL,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        await factory.create(FACTORIES_NAMES.servicePrice, {
            storeId: null,
            pricingTierId: deliveryTier.id,
            serviceId: dryCleaningService.id,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await getAvailableDryCleaningServicesForStore(payload);
        const { dryCleaningServices } = uowOutput;

        // assert
        expect(dryCleaningServices).to.exist;
        expect(dryCleaningServices.length).to.equal(0);
    });
});
