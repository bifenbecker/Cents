require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const StoreSetting = require('../../../../models/storeSettings');
const fetchStoreSettings = require('../../../../uow/store/fetchStoreSettingsUow');

describe('test fetchStoreSettings UoW', () => {
    let store;

    beforeEach(async () => {
        store = await factory.create(FACTORIES_NAMES.store);
    });

    it('should get the StoreSettings model for a given store', async () => {
        const output = await fetchStoreSettings({ storeId: store.id });
        const foundStoreSettings = await StoreSetting.query().findOne({ storeId: store.id });

        // assert
        expect(output.storeSettings).to.deep.equal(foundStoreSettings);
    });
});
