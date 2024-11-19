require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const InventoryItem = require('../../../../models/inventoryItem');

const retrieveCurrentInventoryItemQuantity = require('../../../../uow/products/retrieveCurrentInventoryItemQuantityUow');

describe('test retrieveCurrentInventoryItemQuantityUow', () => {
    let inventoryItem;

    beforeEach(async () => {
        inventoryItem = await factory.create('inventoryItem', {
            quantity: 10,
        });
    });

    it('should retrieve the current inventory item and set payload details', async () => {
        const payload = {
            inventoryItemId: inventoryItem.id,
        };

        // call Uow
        const uowOutput = await retrieveCurrentInventoryItemQuantity(payload);

        // assert
        const foundItem = await InventoryItem.query().findById(inventoryItem.id);
        expect(foundItem.id).to.equal(inventoryItem.id);
        expect(uowOutput.currentInventoryItemQuantity).to.equal(inventoryItem.quantity);
        expect(uowOutput.storeId).to.equal(inventoryItem.storeId);
    });
});
