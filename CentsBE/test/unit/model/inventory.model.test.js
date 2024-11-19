require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const Inventory = require('../../../models/inventory');

describe('test Inventory model', () => {
    it('should return true if Inventory table exists', async () => {
        const hasTableName = await hasTable(Inventory.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(Inventory.idColumn).to.equal('id');
    });

    it('Inventory should have inventoryItems association', () => {
        hasAssociation(Inventory, 'inventoryItems');
    });

    it('Inventory should have many inventoryItems association', async () => {
        hasMany(Inventory, 'inventoryItems');
    });

    it('Inventory should have inventoryCategory association', async () => {
        hasAssociation(Inventory, 'inventoryCategory');
    });

    it('Inventory should BelongsToOneRelation inventoryCategory association', async () => {
        belongsToOne(Inventory, 'inventoryCategory')
    })

});
