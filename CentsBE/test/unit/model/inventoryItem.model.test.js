require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
} = require('../../support/objectionTestHelper');
const factory = require('../../factories');
const InventoryItem = require('../../../models/inventoryItem');

describe('test InventoryItem model', () => {
    it('should return true if InventoryItem table exists', async () => {
        const hasTableName = await hasTable(InventoryItem.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(InventoryItem.idColumn).to.equal('id');
    });

    it('InventoryItem should have store association', async () => {
        hasAssociation(InventoryItem, 'store');
    });

    it('InventoryItem should BelongsToOneRelation store association', async () => {
        belongsToOne(InventoryItem, 'store')
    });

    it('InventoryItem should have inventory association', async () => {
        hasAssociation(InventoryItem, 'inventory');
    });

    it('InventoryItem should BelongsToOneRelation inventory association', async () => {
        belongsToOne(InventoryItem, 'inventory')
    });

    it('InventoryItem should have referenceItems association', () => {
        hasAssociation(InventoryItem, 'referenceItems');
    });

    it('InventoryItem should have many referenceItems association', async () => {
        hasMany(InventoryItem, 'referenceItems');
    });

    it('InventoryItem should have inventoryLineItems association', () => {
        hasAssociation(InventoryItem, 'inventoryLineItems');
    });

    it('InventoryItem should have many inventoryLineItems association', async () => {
        hasMany(InventoryItem, 'inventoryLineItems');
    });
    
    it('InventoryItem should have serviceLineItems association', () => {
        hasAssociation(InventoryItem, 'serviceLineItems');
    });

    it('InventoryItem should have many serviceLineItems association', async () => {
        hasMany(InventoryItem, 'serviceLineItems');
    });

    it('InventoryItem should have inventoryChanges association', () => {
        hasAssociation(InventoryItem, 'inventoryChanges');
    });

    it('InventoryItem should have many inventoryChanges association', async () => {
        hasMany(InventoryItem, 'inventoryChanges');
    });

    it('InventoryItem should have pricingTier association', async () => {
        hasAssociation(InventoryItem, 'pricingTier');
    });

    it('InventoryItem should BelongsToOneRelation pricingTier association', async () => {
        belongsToOne(InventoryItem, 'pricingTier')
    });

    it('InventoryItem should have updatedAt field when updated for beforeUpdate hook', async () => {
        const inventoryItem = await factory.create('inventoryItem');
        const updatedInventoryItem = await InventoryItem.query()
            .patch({
                price: 1234,
            })
            .findById(inventoryItem.id)
            .returning('*');
        expect(updatedInventoryItem.updatedAt).to.not.be.null;
        expect(updatedInventoryItem.updatedAt).to.not.be.undefined;
        expect(updatedInventoryItem.updatedAt).to.be.a.dateString();
    });

    it('InventoryItem should update deletedAt field when deleted for beforeUpdate hook', async () => {
        const inventoryItem = await factory.create('inventoryItem');

        const deletedInventoryItem = await InventoryItem.query()
            .patch({
                isDeleted: true,
            })
            .findById(inventoryItem.id)
            .returning('*');
        expect(deletedInventoryItem.deletedAt).to.not.be.null;
        expect(deletedInventoryItem.deletedAt).to.not.be.undefined;
        expect(deletedInventoryItem.deletedAt).to.be.a.dateString();
    });
});
