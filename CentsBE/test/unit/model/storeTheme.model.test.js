require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
    hasOneThrough,
} = require('../../support/objectionTestHelper');
const StoreTheme = require('../../../models/storeTheme');
const factory = require('../../factories');

describe('test StoreTheme model', () => {
    it('should return true if storeTheme table exists', async () => {
        const hasTableName = await hasTable(StoreTheme.tableName);
        expect(hasTableName).to.be.true;
    });

    it('StoreTheme should have store association', async () => {
        hasAssociation(StoreTheme, 'store');
    });

    it('StoreTheme should BelongsToOneRelation store association', async () => {
        belongsToOne(StoreTheme, 'store');
    });

    it('StoreTheme should have business association', async () => {
        hasAssociation(StoreTheme, 'business');
    });

    it('StoreTheme should HasOneThroughRelation business association', async () => {
        hasOneThrough(StoreTheme, 'business');
    });

    it('StoreTheme should have updatedAt field when updated for beforeUpdate hook', async () => {
        const storeTheme = await factory.create('storeTheme');
        const initialStoreTheme = await StoreTheme.query().findById(storeTheme.id).returning('*');
        const updatedStoreTheme = await StoreTheme.query()
            .patch({
                store: storeTheme.storeId,
            })
            .findById(storeTheme.id)
            .returning('*');
        expect(updatedStoreTheme.updatedAt).to.not.be.null;
        expect(updatedStoreTheme.updatedAt).to.not.be.undefined;
        expect(updatedStoreTheme.updatedAt).to.be.a.dateString();
        expect(initialStoreTheme.updatedAt.getTime()).to.not.equal(
            updatedStoreTheme.updatedAt.getTime(),
        );
    });

    it('StoreTheme should set updatedAt according insert', async () => {
        const time = new Date().toUTCString();
        const storeTheme = await factory.create('storeTheme');
        const updatedStoreTheme = await StoreTheme.query()
            .patch({
                store: storeTheme.storeId,
                updatedAt: time,
            })
            .findById(storeTheme.id)
            .returning('*');
        expect(updatedStoreTheme.updatedAt).to.not.be.null;
        expect(updatedStoreTheme.updatedAt).to.not.be.undefined;
        expect(updatedStoreTheme.updatedAt).to.be.a.dateString();
        expect(updatedStoreTheme.updatedAt.toUTCString()).equal(time);
    });
});
