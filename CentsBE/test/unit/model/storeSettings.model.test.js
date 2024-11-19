require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const { hasAssociation, hasTable, belongsToOne } = require('../../support/objectionTestHelper');
const StoreSettings = require('../../../models/storeSettings');
const factory = require('../../factories');

describe('test storeSettings model', () => {
    it('should return true if storeSettings table exists', async () => {
        const hasTableName = await hasTable(StoreSettings.tableName);
        expect(hasTableName).to.be.true;
    });

    it('StoreSettings should have store association', async () => {
        hasAssociation(StoreSettings, 'store');
    });

    it('StoreSettings should BelongsToOneRelation store association', async () => {
        belongsToOne(StoreSettings, 'store');
    });

    it('StoreSettings should have deliveryTier association', async () => {
        hasAssociation(StoreSettings, 'deliveryTier');
    });

    it('StoreSettings should BelongsToOneRelation deliveryTier association', async () => {
        belongsToOne(StoreSettings, 'deliveryTier');
    });

    it('StoreSettings should have updatedAt field when updated for beforeUpdate hook', async () => {
        const store = await factory.create('store');
        const initialStoreSettings = await StoreSettings.query()
            .findOne({ storeId: store.id })
            .returning('*');
        const updatedStoreSettings = await StoreSettings.query()
            .patch({
                lng: initialStoreSettings.lng,
            })
            .findById(initialStoreSettings.id)
            .returning('*');
        expect(updatedStoreSettings.updatedAt).to.not.be.null;
        expect(updatedStoreSettings.updatedAt).to.not.be.undefined;
        expect(updatedStoreSettings.updatedAt).to.be.a.dateString();
        expect(initialStoreSettings.updatedAt.getTime()).to.not.equal(
            updatedStoreSettings.updatedAt.getTime(),
        );
    });
});
