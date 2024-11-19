require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const updateStoreSettings = require('../../../../uow/store/updateStoreSettings');
const StoreSettings = require('../../../../models/storeSettings');

describe("test business-owner's update store settings uow", () => {
    let store, storeSettings, payload;

    beforeEach(async () => {
        // create a store.
        store = await factory.create('store');

        // create store settings
        storeSettings = await StoreSettings.query().findOne({ storeId: store.id });
    });

    it('should only update permitted columns', async () => {
        payload = {
            storeId: store.id,
            turnAroundInHours: 24,
            deliveryEnabled: true,
            recurringDiscountInPercent: 20,
            timeZone: 'UTC',
            offerDryCleaningForDelivery: true,
            dryCleaningDeliveryPriceType: 'DELIVERY_TIER',
            customLiveLinkHeader: 'Hey there!',
            customLiveLinkMessage: 'Schedule your next laundry service below!',
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        // Changed columns
        expect(newStoreSettings.turnAroundInHours).to.eq(24);
        expect(newStoreSettings.deliveryEnabled).be.true;
        expect(newStoreSettings.recurringDiscountInPercent).to.eq(20);
        expect(newStoreSettings.offerDryCleaningForDelivery).to.be.true;
        expect(newStoreSettings.dryCleaningDeliveryPriceType).to.eq(
            payload.dryCleaningDeliveryPriceType,
        );
        expect(newStoreSettings.customLiveLinkHeader).to.equal(payload.customLiveLinkHeader);
        expect(newStoreSettings.customLiveLinkMessage).to.equal(payload.customLiveLinkMessage);
        // Unchanged columns
        expect(newStoreSettings.timeZone).to.eq(storeSettings.timeZone);
    });

    it('should update recurringDiscountInPercent column individually', async () => {
        payload = {
            storeId: store.id,
            recurringDiscountInPercent: 20,
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(newStoreSettings.recurringDiscountInPercent).to.eq(20);
    });

    it('should update turnAroundInHours column individually', async () => {
        payload = {
            storeId: store.id,
            turnAroundInHours: 24,
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(newStoreSettings.turnAroundInHours).to.eq(24);
    });

    it('should update deliveryEnabled column individually', async () => {
        payload = {
            storeId: store.id,
            deliveryEnabled: true,
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(newStoreSettings.deliveryEnabled).to.be.true;
    });

    it('should update offerDryCleaningForDelivery column individually', async () => {
        payload = {
            storeId: store.id,
            offerDryCleaningForDelivery: false,
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(newStoreSettings.offerDryCleaningForDelivery).to.be.false;
    });

    it('should update customLiveLinkHeader column individually', async () => {
        payload = {
            storeId: store.id,
            customLiveLinkHeader: 'Howdy!',
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(newStoreSettings.customLiveLinkHeader).to.equal(payload.customLiveLinkHeader);
    });

    it('should update offerDryCleaningForDelivery and dryCleaningDeliveryPriceType columns', async () => {
        payload = {
            storeId: store.id,
            offerDryCleaningForDelivery: false,
            dryCleaningDeliveryPriceType: 'RETAIL',
        };

        await updateStoreSettings(payload);

        const newStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(newStoreSettings.offerDryCleaningForDelivery).to.be.false;
        expect(newStoreSettings.dryCleaningDeliveryPriceType).to.eq(
            payload.dryCleaningDeliveryPriceType,
        );
    });
});
