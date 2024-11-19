require('../../../../../testHelper');
const factory = require('../../../../../factories');
const { FACTORIES_NAMES: FN } = require('../../../../../constants/factoriesNames');
const { expect } = require('../../../../../support/chaiHelper');
const getInventoryItems = require('../../../../../../services/orders/serviceOrders/queries/getInventoryItems');

describe('test getInventoryItems', () => {
    it('should get inventory items successfully', async () => {
        const store = await factory.create(FN.store);
        const inventoryItem = await factory.create(FN.inventoryItem);
        const serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        const serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        const serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            inventoryItemId: inventoryItem.id,
            quantity: 10,
        });
        const result = await getInventoryItems(serviceOrder.id);
        expect(result.length).to.eq(1);
        expect(result[0].inventoryItemId).to.eq(inventoryItem.id);
        expect(result[0].changeInQuantity).to.eq(serviceReferenceItem.quantity);
    });

    it('should throw error when serviceOrderId is not passed', async () => {
        await expect(getInventoryItems({})).to.be.rejected;
    });
});