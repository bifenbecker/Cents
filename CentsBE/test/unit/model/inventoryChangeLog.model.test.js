require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const {
    hasAssociation,
    hasTable,
    hasOne,
} = require('../../support/objectionTestHelper');
const InventoryChangeLog = require('../../../models/inventoryChangeLog');

describe('test InventoryChangeLog model', () => {
    it('should return true if InventoryChangeLog table exists', async () => {
        const hasTableName = await hasTable(InventoryChangeLog.tableName);
        expect(hasTableName).to.be.true;
    });

    it('idColumn should return id', async () => {
        expect(InventoryChangeLog.idColumn).to.equal('id');
    });

    it('InventoryChangeLog should have order association', async () => {
        hasAssociation(InventoryChangeLog, 'order');
    });

    it('InventoryChangeLog should have one order association', async () => {
        hasOne(InventoryChangeLog, 'order')
    })

    it('InventoryChangeLog should have teamMember association', async () => {
        hasAssociation(InventoryChangeLog, 'teamMember');
    });

    it('InventoryChangeLog should have one teamMember association', async () => {
        hasOne(InventoryChangeLog, 'teamMember')
    })

    it('InventoryChangeLog should have inventoryItem association', async () => {
        hasAssociation(InventoryChangeLog, 'inventoryItem');
    });

    it('InventoryChangeLog should have one inventoryItem association', async () => {
        hasOne(InventoryChangeLog, 'inventoryItem')
    })

    it('InventoryChangeLog should have store association', async () => {
        hasAssociation(InventoryChangeLog, 'store');
    });

    it('InventoryChangeLog should have one store association', async () => {
        hasOne(InventoryChangeLog, 'store')
    })

    it('InventoryChangeLog should have business association', async () => {
        hasAssociation(InventoryChangeLog, 'business');
    });

    it('InventoryChangeLog should have one business association', async () => {
        hasOne(InventoryChangeLog, 'business')
    })

    it('InventoryChangeLog should have updatedAt field when updated for beforeUpdate hook', async () => {
        const order = await factory.create('order', {
            orderableId: 1,
            orderableType: 'InventoryOrder',
        });
        const inventoryChangeLog = await factory.create('inventoryChangeLog', {
            orderId: order.id,
            startingAmount: 1,
            endingAmount: 2,
        });
        const updatedInventoryChangeLog = await InventoryChangeLog.query()
            .patch({
                reason: 'reason',
            })
            .findById(inventoryChangeLog.id)
            .returning('*');
        expect(updatedInventoryChangeLog.updatedAt).to.not.be.null;
        expect(updatedInventoryChangeLog.updatedAt).to.not.be.undefined;
        expect(updatedInventoryChangeLog.updatedAt).to.be.a.dateString();
    });
});