require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const InventoryItem = require('../../../../../models/inventoryItem');
const InventoryChangeLog = require('../../../../../models/inventoryChangeLog');
const updateInventoryItems = require('../../../../../uow/order/serviceOrder/updateInventoryItems');
const { createInventoryPayload } = require('../../../../support/serviceOrderTestHelper');
const factory = require('../../../../factories');

describe('test updateInventoryItems UOW', () => {
    let inventoryPayload, store, order, serviceOrder;
    beforeEach(async () => {
        store = await factory.create('store');
        serviceOrder = await factory.create('serviceOrder');
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
            storeId: store.id,
        });

        inventoryPayload = await createInventoryPayload(store);
        inventoryOrderItems = [
            {
                inventoryItemId: inventoryPayload.inventoryItem.id,
                price: 100,
                referenceItems: [
                    {
                        inventoryItemId: inventoryPayload.inventoryItem.id,
                    },
                ],
                changeInQuantity: -1,
                lineItemType: 'INVENTORY',
            },
        ];
        payload = {
            inventoryOrderItems,
            order,
        };
    });

    it('should update the inventory quantity for the selected items', async () => {
        const result = await updateInventoryItems(payload);
        const inventoryItem = await InventoryItem.query().findById(
            inventoryPayload.inventoryItem.id,
        );
        const inventoryChangeLog = await InventoryChangeLog.query().findOne({
            orderId: order.id,
            inventoryItemId: inventoryItem.id,
        });
        expect(inventoryItem).to.have.property('quantity').equal(0);
        expect(inventoryChangeLog).to.have.property('amountChanged').equal(-1);
    });

    it('should not update the inventoryItems if not selected', async () => {
        const result = await updateInventoryItems({ inventoryOrderItems: [] });
        const inventoryItem = await InventoryItem.query().findById(
            inventoryPayload.inventoryItem.id,
        );
        expect(inventoryItem).to.have.property('quantity').equal(1);
    });
});
