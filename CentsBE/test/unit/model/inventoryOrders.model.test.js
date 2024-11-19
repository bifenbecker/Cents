require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const {
    hasAssociation,
    hasTable,
    hasMany,
    belongsToOne,
    hasOne,
} = require('../../support/objectionTestHelper');
const InventoryOrders = require('../../../models/inventoryOrders');

describe('test InventoryOrders model', () => {
    it('should return true if inventoryOrders table exists', async () => {
        const hasTableName = await hasTable(InventoryOrders.tableName);
        expect(hasTableName).to.be.true;
    });

    it('inventoryOrders should have inventoryOrderLineItems association', () => {
        hasAssociation(InventoryOrders, 'lineItems');
    });

    it('inventoryOrders should have many inventoryOrderLineItems association', async () => {
        hasMany(InventoryOrders, 'lineItems');
    });

    it('inventoryOrders should BelongsToOneRelation stores association', async () => {
        belongsToOne(InventoryOrders, 'store');
    });

    it('inventoryOrders should BelongsToOneRelation storeCustomers association', async () => {
        belongsToOne(InventoryOrders, 'customer');
    });

    it('inventoryOrders should have one orders association', async () => {
        hasOne(InventoryOrders, 'order');
    });

    it('inventoryOrders should BelongsToOneRelation businessPromotionPrograms association', async () => {
        belongsToOne(InventoryOrders, 'promotion');
    });

    it('inventoryOrders should BelongsToOneRelation teamMembers association', async () => {
        belongsToOne(InventoryOrders, 'employee');
    });
});
