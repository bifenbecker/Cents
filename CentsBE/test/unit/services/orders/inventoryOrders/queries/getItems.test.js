require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { expect } = require('../../../../../support/chaiHelper');
const getInventoryOrderItems = require('../../../../../../services/orders/inventoryOrders/queries/getItems');

describe('getItems test', function () {
    let inventoryOrder, inventoryItem, inventoryOrderItem;
    beforeEach(async () => {
        inventoryOrder = await factory.create('inventoryOrder');
        inventoryItem = await factory.create('inventoryItem');
        inventoryOrderItem = await factory.create('inventoryOrderItem', {
            inventoryItemId: inventoryItem.id,
            inventoryOrderId: inventoryOrder.id,
        });
    });

    it('should return correct changeInQuantity', async () => {
        const res = await getInventoryOrderItems(inventoryOrder.id);

        expect(res[0].changeInQuantity).equal(inventoryOrderItem.lineItemQuantity);
    });

    it('should return empty array if wrong inventoryOrder id provided', async () => {
        const res = await getInventoryOrderItems(1234);

        expect(res).deep.equal([]);
    });
});
