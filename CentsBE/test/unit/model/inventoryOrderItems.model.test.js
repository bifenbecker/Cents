require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const InventoryOrderItems = require('../../../models/inventoryOrderItems');

describe('test InventoryOrderItems model', () => {
    it('should return true if InventoryOrderItems table exists', async () => {
        const hasTableName = await hasTable(InventoryOrderItems.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(InventoryOrderItems.idColumn).to.equal('id');
    });

    it('InventoryOrderItems should have inventoryItem association', async () => {
        hasAssociation(InventoryOrderItems, 'inventoryItem');
    });

    it('InventoryOrderItems should BelongsToOneRelation inventoryItem association', async () => {
        belongsToOne(InventoryOrderItems, 'inventoryItem')
    })

    it('InventoryOrderItems should have inventoryOrder association', async () => {
        hasAssociation(InventoryOrderItems, 'inventoryOrder');
    });

    it('InventoryOrderItems should BelongsToOneRelation inventoryOrder association', async () => {
        belongsToOne(InventoryOrderItems, 'inventoryOrder')
    })

});