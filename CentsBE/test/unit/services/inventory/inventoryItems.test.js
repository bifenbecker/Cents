require('../../../testHelper');
const { expect, faker } = require('../../../support/chaiHelper');
const updateInventory = require('../../../../services/inventory/inventoryItems');
const factory = require('../../../factories');
const InventoryItem = require('../../../../models/inventoryItem');
const InventoryChangeLog = require('../../../../models/inventoryChangeLog');

describe('updateInventory test', function () {
    let laundromatBusiness,
        store,
        inventoryItem,
        inventoryOrderMasterOrder,
        serviceOrderMasterOrder;
    let orderInventoryItems = [];
    let orderInventoryItemsIds = [];
    beforeEach(async () => {
        laundromatBusiness = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: laundromatBusiness.id });
        inventoryOrderMasterOrder = await factory.create('inventoryOrderMasterOrder', {
            storeId: store.id,
        });
        serviceOrderMasterOrder = await factory.create('serviceOrderMasterOrder', {
            storeId: store.id,
        });
        inventoryItem = await factory.createMany('inventoryItem', 3);
        for (let item of inventoryItem) {
            orderInventoryItems.push({
                inventoryItemId: item.id,
                changeInQuantity: faker.random.number(),
            });
            orderInventoryItemsIds.push(item.id);
        }
    });

    afterEach(() => {
        orderInventoryItems = [];
        orderInventoryItemsIds = [];
    });

    it('should successfully insert entries into inventoryChangeLog', async () => {
        await updateInventory(inventoryOrderMasterOrder, orderInventoryItems);
        const items = await InventoryChangeLog.query()
            .select('*')
            .whereIn('inventoryItemId', orderInventoryItemsIds)
            .orderBy('inventoryItemId');
        items.forEach((item, i) => {
            expect(item.amountChanged).equal(orderInventoryItems[i].changeInQuantity);
            expect(item.storeId).equal(store.id);
            expect(item.entryPoint).equal(inventoryOrderMasterOrder.orderableType);
            expect(item.orderId).equal(inventoryOrderMasterOrder.id);
            expect(item.businessId).equal(laundromatBusiness.id);
            expect(item.reason).equal('INVENTORY_ORDER_SALE');
            expect(item.startingAmount).equal(inventoryItem[i].quantity);
            expect(item.endingAmount).equal(
                inventoryItem[i].quantity + orderInventoryItems[i].changeInQuantity,
            );
        });
    });

    it('should patch quantity in all inventory items', async () => {
        await updateInventory(inventoryOrderMasterOrder, orderInventoryItems);
        const items = await InventoryItem.query()
            .select('*')
            .whereIn('id', orderInventoryItemsIds)
            .orderBy('id');
        items.forEach((item, i) => {
            expect(item.quantity).equal(
                inventoryItem[i].quantity + orderInventoryItems[i].changeInQuantity,
            );
        });
    });

    it('should throw error if item with wrong inventoryItemId provided', async () => {
        await expect(
            updateInventory(
                [
                    {
                        inventoryItemId: -12345,
                        changeInQuantity: faker.random.number(),
                    },
                ],
                orderInventoryItems,
            ),
        ).to.be.rejected;
    });
});
