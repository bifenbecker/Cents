require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');
const updateInventoryItems = require('../../../../../uow/order/serviceOrder/updateInventoryItems');
const InventoryItem = require('../../../../../models/inventoryItem');
const InventoryChangeLog = require('../../../../../models/inventoryChangeLog');


describe('test updateInventoryItems UOW', () => {
    let store, serviceOrder, order, inventoryItem;
    beforeEach(async () => {
        store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
            updatedAt: new Date().toISOString(),
        });
        order = await factory.create(FN.order, {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });
        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
            quantity: 10,
        });
    });

    it('should fail when payload is empty', async () => {
        await expect(updateInventoryItems({})).to.be.rejected;
    });


    it('should update inventoryItems, create chengeLog and return payload', async () => {
        const changeInQuantity = 2;
        const payload = { 
            order,
            inventoryOrderItems: [{
                inventoryItemId: inventoryItem.id,
                changeInQuantity,
            }],
        };
        const expectedChangeLog = {
            inventoryItemId: inventoryItem.id,
            businessId: store.businessId,
            storeId: store.id,
            orderId: order.id,
            startingAmount: inventoryItem.quantity,
            amountChanged: changeInQuantity,
            endingAmount: inventoryItem.quantity + changeInQuantity,
            entryPoint: order.orderableType,
        };
        const result = await updateInventoryItems(payload);
        const updatedInventoryItem = await InventoryItem.query().select('*').findById(inventoryItem.id);
        const inventoryChangeLog = await InventoryChangeLog.query().select('*').findOne({
            inventoryItemId: inventoryItem.id,
        });

        expect(result).to.include(payload);
        expect(updatedInventoryItem.quantity).to.equal(inventoryItem.quantity + changeInQuantity);
        expect(inventoryChangeLog).to.include(expectedChangeLog);
    });
});
