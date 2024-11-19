require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const InventoryItem = require('../../../../models/inventoryItem');

const updateInventoryItem = require('../../../../uow/products/updateInventoryItemUow');

describe('test updateInventoryItemUow', () => {
    let inventoryItem;

    beforeEach(async () => {
        inventoryItem = await factory.create('inventoryItem', {
            quantity: 10,
        });
    });

    it('should update the inventory quantity', async () => {
        const payload = {
            inventoryItemId: inventoryItem.id,
            field: 'quantity',
            value: 9,
        };

        // call Uow
        const uowOutput = await updateInventoryItem(payload);

        // assert
        const foundItem = await InventoryItem.query().findById(inventoryItem.id);
        expect(foundItem.id).to.equal(inventoryItem.id);
        expect(uowOutput.updatedProduct.quantity).to.equal(payload.value);
    });

    it('should update the inventory price', async () => {
        const payload = {
            inventoryItemId: inventoryItem.id,
            field: 'price',
            value: 2.5,
        };

        // call Uow
        const uowOutput = await updateInventoryItem(payload);

        // assert
        const foundItem = await InventoryItem.query().findById(inventoryItem.id);
        expect(foundItem.id).to.equal(inventoryItem.id);
        expect(uowOutput.updatedProduct.price).to.equal(payload.value);
    });
});
