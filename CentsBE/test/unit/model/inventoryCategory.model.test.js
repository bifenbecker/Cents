require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const InventoryCategory = require('../../../models/inventoryCategory');

describe('test InventoryCategory model', () => {
    it('should return true if InventoryCategory table exists', async () => {
        const hasTableName = await hasTable(InventoryCategory.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(InventoryCategory.idColumn).to.equal('id');
    });

    it('InventoryCategory should have inventory association', () => {
        hasAssociation(InventoryCategory, 'inventory');
    });

    it('InventoryCategory should have many inventory association', async () => {
        hasMany(InventoryCategory, 'inventory');
    });

    it('InventoryCategory should have business association', async () => {
        hasAssociation(InventoryCategory, 'business');
    });

    it('InventoryCategory should BelongsToOneRelation business association', async () => {
        belongsToOne(InventoryCategory, 'business')
    })
});
