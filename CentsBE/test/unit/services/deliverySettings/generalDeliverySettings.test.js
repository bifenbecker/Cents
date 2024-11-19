require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const GeneralDeliverySettings = require('../../../../services/deliverySettings/generalDeliverySettings');
const StoreSettings = require('../../../../models/storeSettings');
const CentsDeliverySettings = require('../../../../models/centsDeliverySettings');
const OwnDeliverySettings = require('../../../../models/ownDeliverySettings');

describe('test generalDeliverySettings service', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness);
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
    });

    it('should create an instance of the class', async () => {
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);

        expect(generalDeliverySettings).to.have.property('storeId').equal(store.id);
    });

    it('storeSettings should return the StoreSetting model and specified fields for the store when fields not provided', async () => {
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const storeSettings = await generalDeliverySettings.storeSettings();
        const foundStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(storeSettings).to.have.property('id').to.equal(foundStoreSettings.id);
        expect(storeSettings).to.have.property('storeId').to.equal(store.id);
        expect(storeSettings)
            .to.have.property('deliveryEnabled')
            .to.equal(foundStoreSettings.deliveryEnabled);
        expect(storeSettings)
            .to.have.property('turnAroundInHours')
            .to.equal(foundStoreSettings.turnAroundInHours);
        expect(storeSettings)
            .to.have.property('deliveryPriceType')
            .to.equal(foundStoreSettings.deliveryPriceType);
        expect(storeSettings)
            .to.have.property('recurringDiscountInPercent')
            .to.equal(foundStoreSettings.recurringDiscountInPercent);
        expect(storeSettings)
            .to.have.property('offerDryCleaningForDelivery')
            .to.equal(foundStoreSettings.offerDryCleaningForDelivery);
        expect(storeSettings)
            .to.have.property('dryCleaningDeliveryPriceType')
            .to.equal(foundStoreSettings.dryCleaningDeliveryPriceType);
        expect(storeSettings)
            .to.have.property('customLiveLinkHeader')
            .to.equal(foundStoreSettings.customLiveLinkHeader);
        expect(storeSettings)
            .to.have.property('customLiveLinkMessage')
            .to.equal(foundStoreSettings.customLiveLinkMessage);
    });

    it('storeSettings should return the StoreSetting model and specified fields for the store when fields provided', async () => {
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const storeSettings = await generalDeliverySettings.storeSettings([
            'offerDryCleaningForDelivery',
        ]);
        const foundStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(storeSettings)
            .to.have.property('offerDryCleaningForDelivery')
            .to.equal(foundStoreSettings.offerDryCleaningForDelivery);
        expect(storeSettings).to.not.have.property('storeId');
    });

    it('storeSettings should return the StoreSetting model and specified fields for the store when fields provided', async () => {
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const storeSettings = await generalDeliverySettings.storeSettings([
            'customLiveLinkHeader',
            'customLiveLinkMessage',
        ]);
        const foundStoreSettings = await StoreSettings.query().findOne({ storeId: store.id });

        expect(storeSettings)
            .to.have.property('customLiveLinkHeader')
            .to.equal(foundStoreSettings.customLiveLinkHeader);
        expect(storeSettings)
            .to.have.property('customLiveLinkMessage')
            .to.equal(foundStoreSettings.customLiveLinkMessage);
    });

    it('centsDeliverySettings should return the CentsDeliverySettings model and specified fields for the store when fields not provided', async () => {
        await factory.create(FACTORIES_NAMES.centsDeliverySettings, {
            storeId: store.id,
        });
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const centsDeliverySettings = await generalDeliverySettings.centsDeliverySettings();
        const foundCentsDeliverySettings = await CentsDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(centsDeliverySettings)
            .to.have.property('id')
            .to.equal(foundCentsDeliverySettings.id);
        expect(centsDeliverySettings)
            .to.have.property('active')
            .to.equal(foundCentsDeliverySettings.active);
        expect(centsDeliverySettings).to.have.property('storeId').to.equal(store.id);
        expect(centsDeliverySettings)
            .to.have.property('subsidyInCents')
            .to.equal(foundCentsDeliverySettings.subsidyInCents);
        expect(centsDeliverySettings)
            .to.have.property('returnOnlySubsidyInCents')
            .to.equal(foundCentsDeliverySettings.returnOnlySubsidyInCents);
        expect(centsDeliverySettings)
            .to.have.property('doorDashEnabled')
            .to.equal(foundCentsDeliverySettings.doorDashEnabled);
    });

    it('centsDeliverySettings should return the CentsDeliverySettings model and specified fields for the store when fields provided', async () => {
        await factory.create(FACTORIES_NAMES.centsDeliverySettings, {
            storeId: store.id,
        });
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const centsDeliverySettings = await generalDeliverySettings.centsDeliverySettings([
            'doorDashEnabled',
        ]);
        const foundCentsDeliverySettings = await CentsDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(centsDeliverySettings)
            .to.have.property('doorDashEnabled')
            .to.equal(foundCentsDeliverySettings.doorDashEnabled);
        expect(centsDeliverySettings).to.not.have.property('storeId');
    });

    it('ownDeliverySettings should return the OwnDeliverySettings model and specified fields for the store when fields not provided', async () => {
        await factory.create(FACTORIES_NAMES.ownDeliverySetting, {
            storeId: store.id,
        });
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const ownDeliverySettings = await generalDeliverySettings.ownDeliverySettings();
        const foundOwnDeliverySettings = await OwnDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(ownDeliverySettings).to.have.property('id').to.equal(foundOwnDeliverySettings.id);
        expect(ownDeliverySettings)
            .to.have.property('active')
            .to.equal(foundOwnDeliverySettings.active);
        expect(ownDeliverySettings).to.have.property('storeId').to.equal(store.id);
        expect(ownDeliverySettings)
            .to.have.property('zipCodes')
            .to.equal(foundOwnDeliverySettings.zipCodes);
        expect(ownDeliverySettings)
            .to.have.property('hasZones')
            .to.equal(foundOwnDeliverySettings.hasZones);
        expect(ownDeliverySettings)
            .to.have.property('deliveryFeeInCents')
            .to.equal(foundOwnDeliverySettings.deliveryFeeInCents);
        expect(ownDeliverySettings)
            .to.have.property('returnDeliveryFeeInCents')
            .to.equal(foundOwnDeliverySettings.returnDeliveryFeeInCents);
        expect(ownDeliverySettings)
            .to.have.property('deliveryWindowBufferInHours')
            .to.equal(foundOwnDeliverySettings.deliveryWindowBufferInHours);
    });

    it('ownDeliverySettings should return the OwnDeliverySettings model and specified fields for the store when fields provided', async () => {
        await factory.create(FACTORIES_NAMES.ownDeliverySetting, {
            storeId: store.id,
        });
        const generalDeliverySettings = new GeneralDeliverySettings(store.id);
        const ownDeliverySettings = await generalDeliverySettings.ownDeliverySettings([
            'returnDeliveryFeeInCents',
        ]);
        const foundOwnDeliverySettings = await OwnDeliverySettings.query().findOne({
            storeId: store.id,
        });

        expect(ownDeliverySettings)
            .to.have.property('returnDeliveryFeeInCents')
            .to.equal(foundOwnDeliverySettings.returnDeliveryFeeInCents);
        expect(ownDeliverySettings).to.not.have.property('storeId');
    });
});
