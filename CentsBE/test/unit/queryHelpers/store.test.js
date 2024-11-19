require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const StoreQuery = require('../../../queryHelpers/store');
const OwnDeliverySettings = require('../../../models/ownDeliverySettings');
const CentsDeliverySettings = require('../../../models/centsDeliverySettings');

describe('test store queryHelper', () => {
    let business, store;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id
        });
    });

    it('should create an instance of the class', async () => {
        const storeQuery = new StoreQuery(store.id);

        expect(storeQuery).to.have.property('storeId').equal(store.id);
    });

    it('settings should return the StoreSetting model for the store', async () => {
        const storeQuery = new StoreQuery(store.id);
        const storeSettings = await storeQuery.settings();

        expect(storeSettings).to.have.property('storeId').to.equal(store.id);
    });

    it('ownDeliverySettings should return the active OwnDeliverySetting model for the store', async () => {
        const ownDeliverySettings = await factory.create('ownDeliverySetting', {
          storeId: store.id,
          active: true,
        })
        const storeQuery = new StoreQuery(store.id);
        const foundOwnDeliverySettings = await storeQuery.ownDeliverySettings();

        expect(foundOwnDeliverySettings).to.exist;
        expect(foundOwnDeliverySettings.id).to.equal(ownDeliverySettings.id);
        expect(foundOwnDeliverySettings.active).to.be.true;
    });

    it('ownDeliverySettings should not return anything if OwnDeliverySetting model is not active for the store', async () => {
        await OwnDeliverySettings.query()
            .patch({
                active: false,
            })
            .findOne({ storeId: store.id });
        const storeQuery = new StoreQuery(store.id);
        const foundOwnDeliverySettings = await storeQuery.ownDeliverySettings();

        expect(foundOwnDeliverySettings).to.be.undefined;
    });

    it('onDemandSettings should return the active CentsDeliverySetting model for the store', async () => {
        const onDemandSettings = await factory.create('centsDeliverySettings', {
          storeId: store.id,
          active: true,
        })
        const storeQuery = new StoreQuery(store.id);
        const foundOnDemandSettings = await storeQuery.onDemandSettings();

        expect(foundOnDemandSettings).to.exist;
        expect(foundOnDemandSettings.id).to.equal(onDemandSettings.id);
        expect(foundOnDemandSettings.active).to.be.true;
    });

    it('onDemandSettings should not return anything if CentsDeliverySetting model is not active for the store', async () => {
        await CentsDeliverySettings.query()
            .patch({
                active: false,
            })
            .findOne({ storeId: store.id });
        const storeQuery = new StoreQuery(store.id);
        const foundOnDemandSettings = await storeQuery.onDemandSettings();

        expect(foundOnDemandSettings).to.be.undefined;
    });

    it('taxRate should return the taxRate relation for the store', async () => {
        const taxRateFactory = await factory.create('taxRate', {
          businessId: business.id,
          rate: 7.5,
        });
        const storeWithTaxRate = await factory.create('store', {
          businessId: business.id,
          taxRateId: taxRateFactory.id,
        });
        const storeQuery = new StoreQuery(storeWithTaxRate.id);
        const taxRate = await storeQuery.taxRate();

        expect(taxRate.id).to.deep.equal(storeWithTaxRate.taxRateId);
    });

    it('taxRate should be null if a taxRate relation for a store does not exist', async () => {
        const storeWithoutTaxRate = await factory.create('store', {
          businessId: business.id,
          taxRateId: null,
        });
        const storeQuery = new StoreQuery(storeWithoutTaxRate.id);
        const taxRate = await storeQuery.taxRate();

        expect(taxRate).to.be.null;
    });

    it('details should return the Store model details for the store', async () => {
        const storeQuery = new StoreQuery(store.id);
        const details = await storeQuery.details();

        expect(details).to.have.property('id').to.equal(store.id);
    });
})
