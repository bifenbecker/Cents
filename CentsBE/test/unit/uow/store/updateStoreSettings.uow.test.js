require('../../../testHelper');
const { expect} = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const updateStoreSettings = require('../../../../uow/store/updateStoreSettings');
const StoreSetting = require('../../../../models/storeSettings');

describe('test updateStoreSettingsUow', () => {
    let tier, payload, updatedStoreSettings, store, laundromatBusiness;
    beforeEach(async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        store = await factory.create('store', {businessId: laundromatBusiness.id});
        tier = await factory.create('pricingTierDelivery', {businessId: laundromatBusiness.id});
        payload = {
            deliveryTierId: tier.id,
            deliveryPriceType: 'RETAIL',
            storeId: store.id,
        }
    });
    it('should update storeSettings successfully', async () => {
        await updateStoreSettings(payload);
        updatedStoreSettings = await StoreSetting.query().where('storeId', store.id).first();
        expect(updatedStoreSettings).to.have.a.property('deliveryTierId').to.equal(tier.id);
        expect(updatedStoreSettings).to.have.a.property('deliveryPriceType').to.equal('RETAIL');
    });
});

