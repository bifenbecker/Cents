require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');

const StoreSettings = require('../../../../../models/storeSettings');
const getAvailableLaundryServicesForStore = require('../../../../../uow/liveLink/services/getAvailableLaundryServicesForStoreUow');
const { deliveryPriceTypes, pricingTiersTypes } = require('../../../../../constants/constants');

describe('test getAvailableLaundryServicesForStore UoW', () => {
    let laundryCategoryType, business, store, deliveryTier, serviceCategory, laundryService;

    beforeEach(async () => {
        laundryCategoryType = await factory.create(FACTORIES_NAMES.serviceCategoryType);
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
          serviceCategoryTypeId: laundryCategoryType.id,
          category: 'Wash & Fold',
        });
        laundryService = await factory.create(FACTORIES_NAMES.serviceMaster, {
            serviceCategoryId: serviceCategory.id,
        });
    });

    it('should fetch a list of laundry services if store has delivery tier', async () => {
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
            serviceId: laundryService.id,
            isDeliverable: true,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await getAvailableLaundryServicesForStore(payload);
        const { laundryServices } = uowOutput;

        // assert
        expect(laundryServices).to.exist;
        expect(laundryServices[0].id).to.equal(servicePrice.id);
        expect(laundryServices[0].pricingTierId).to.equal(deliveryTier.id);
        expect(laundryServices[0].storeId).to.be.null;
    });

    it('should fetch an empty list of laundry services if store has delivery tier but no tiered services', async () => {
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
            serviceId: laundryService.id,
            isDeliverable: true,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await getAvailableLaundryServicesForStore(payload);
        const { laundryServices } = uowOutput;

        // assert
        expect(laundryServices).to.exist;
        expect(laundryServices.length).to.equal(0);
    });

    it('should fetch an empty list of laundry services if store has delivery tier but tiered services are not deliverable', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                deliveryTierId: deliveryTier.id,
                deliveryPriceType: deliveryPriceTypes.DELIVERY_TIER,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        await factory.create(FACTORIES_NAMES.servicePrice, {
            storeId: null,
            pricingTierId: deliveryTier.id,
            serviceId: laundryService.id,
            isDeliverable: false,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await getAvailableLaundryServicesForStore(payload);
        const { laundryServices } = uowOutput;

        // assert
        expect(laundryServices).to.exist;
        expect(laundryServices.length).to.equal(0);
    });

    it('should fetch a list of laundry services if store has no delivery tier', async () => {
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
            serviceId: laundryService.id,
            isDeliverable: true,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await getAvailableLaundryServicesForStore(payload);
        const { laundryServices } = uowOutput;

        // assert
        expect(laundryServices).to.exist;
        expect(laundryServices[0].id).to.equal(servicePrice.id);
        expect(laundryServices[0].storeId).to.equal(store.id);
        expect(laundryServices[0].pricingTierId).to.be.null;
    });

    it('should fetch an empty list of laundry services if store has retail pricing but no retail services', async () => {
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
            serviceId: laundryService.id,
            isDeliverable: true,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await getAvailableLaundryServicesForStore(payload);
        const { laundryServices } = uowOutput;

        // assert
        expect(laundryServices).to.exist;
        expect(laundryServices.length).to.equal(0);
    });

    it('should fetch an empty list of laundry services if store has retail pricing and retail services but is not deliveable', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                deliveryTierId: null,
                deliveryPriceType: deliveryPriceTypes.RETAIL,
            })
            .findOne({ storeId: store.id })
            .returning('*');
        await factory.create(FACTORIES_NAMES.servicePrice, {
            storeId: store.id,
            pricingTierId: null,
            serviceId: laundryService.id,
            isDeliverable: false,
        });
        const payload = {
            storeId: store.id,
            storeSettings,
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await getAvailableLaundryServicesForStore(payload);
        const { laundryServices } = uowOutput;

        // assert
        expect(laundryServices).to.exist;
        expect(laundryServices.length).to.equal(0);
    });
});
