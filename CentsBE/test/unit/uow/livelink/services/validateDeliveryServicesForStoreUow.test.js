require('../../../../testHelper');

const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const { expect } = require('../../../../support/chaiHelper');

const StoreSettings = require('../../../../../models/storeSettings');
const validateDeliveryServicesForStore = require('../../../../../uow/liveLink/services/validateDeliveryServicesForStoreUow');

describe('test validateDeliveryServicesForStore UoW', () => {
    let store;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
    });

    it('should return true for all values for retail pricing', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: true,
                dryCleaningDeliveryPriceType: 'RETAIL',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            dryCleaningServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.true;
        expect(hasLaundry).to.be.true;
        expect(offerDryCleaningForDelivery).to.be.true;
    });

    it('should return true for all values for delivery tier pricing', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: true,
                dryCleaningDeliveryPriceType: 'DELIVERY_TIER',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            dryCleaningServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.true;
        expect(hasLaundry).to.be.true;
        expect(offerDryCleaningForDelivery).to.be.true;
    });

    it('should return true for services but false for offerDryCleaningForDelivery if price type is DELIVERY_TIER but no delivery tier assigned', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: false,
                dryCleaningDeliveryPriceType: 'DELIVERY_TIER',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            dryCleaningServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.true;
        expect(hasLaundry).to.be.true;
        expect(offerDryCleaningForDelivery).to.be.false;
    });

    it('should return true for services but false for offerDryCleaningForDelivery if price type is RETAIL but a delivery tier is assigned', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: false,
                dryCleaningDeliveryPriceType: 'RETAIL',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            dryCleaningServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.true;
        expect(hasLaundry).to.be.true;
        expect(offerDryCleaningForDelivery).to.be.false;
    });

    it('should return true for services but false for offerDryCleaningForDelivery if dry cleaning enabled but has a delivery tier', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: true,
                dryCleaningDeliveryPriceType: 'RETAIL',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            dryCleaningServices: [
                {
                    id: 1,
                },
                {
                    id: 2,
                },
            ],
            hasDeliveryTier: true,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.true;
        expect(hasLaundry).to.be.true;
        expect(offerDryCleaningForDelivery).to.be.false;
    });

    it('should return false for services and false for offerDryCleaningForDelivery', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: false,
                dryCleaningDeliveryPriceType: 'DELIVERY_TIER',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [],
            dryCleaningServices: [],
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.false;
        expect(hasLaundry).to.be.false;
        expect(offerDryCleaningForDelivery).to.be.false;
    });

    it('should return false for laundry services, true for dry cleaning, and true for offerDryCleaningForDelivery', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: true,
                dryCleaningDeliveryPriceType: 'RETAIL',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [],
            dryCleaningServices: [{ id: 1 }],
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.true;
        expect(hasLaundry).to.be.false;
        expect(offerDryCleaningForDelivery).to.be.true;
    });

    it('should return true for laundry services, false for dry cleaning, and true for offerDryCleaningForDelivery', async () => {
        const storeSettings = await StoreSettings.query()
            .patch({
                offerDryCleaningForDelivery: true,
                dryCleaningDeliveryPriceType: 'RETAIL',
            })
            .findOne({ storeId: store.id })
            .returning('*');
        const payload = {
            storeSettings,
            laundryServices: [{ id: 1 }],
            dryCleaningServices: [],
            hasDeliveryTier: false,
        };

        // call Uow
        const uowOutput = await validateDeliveryServicesForStore(payload);
        const { hasDryCleaning, hasLaundry, offerDryCleaningForDelivery } = uowOutput;

        // assert
        expect(hasDryCleaning).to.be.false;
        expect(hasLaundry).to.be.true;
        expect(offerDryCleaningForDelivery).to.be.true;
    });

    it('should throw error if payload is not defined', async () => {
        try {
            await validateDeliveryServicesForStore();
        } catch (error) {
            return error;
        }
        // assert error type
        expect(error).to.be.an('Error');

        // assert error message - here, since payload is undefined, destructuring properties will fail
        expect(error.message).to.contain(`Cannot destructure property 'laundryServices'`);
    });
});
