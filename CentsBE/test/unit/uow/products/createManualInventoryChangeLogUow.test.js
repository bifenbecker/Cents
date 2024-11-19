require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const InventoryChangeLog = require('../../../../models/inventoryChangeLog');
const Store = require('../../../../models/store');

const createManualInventoryChangeLog = require('../../../../uow/products/createManualInventoryChangeLowUow');

describe('test createManualInventoryChangeLogUow', () => {
    let inventoryItem;

    beforeEach(async () => {
        inventoryItem = await factory.create('inventoryItem', {
            quantity: 10,
        });
    });

    it('should create an InventoryChangeLog entry', async () => {
        const store = await Store.query().findById(inventoryItem.storeId);
        const payload = {
            inventoryItemId: inventoryItem.id,
            currentInventoryItemQuantity: inventoryItem.quantity,
            businessId: store.businessId,
            storeId: store.id,
            field: 'quantity',
            value: 9,
        };

        // call Uow
        const uowOutput = await createManualInventoryChangeLog(payload);
        const { inventoryChangeLog } = uowOutput;

        // assert
        const foundChangeLog = await InventoryChangeLog.query().findById(inventoryChangeLog.id);
        expect(foundChangeLog.inventoryItemId).to.equal(inventoryItem.id);

        const amountChanged = Number(payload.value - payload.currentInventoryItemQuantity);
        expect(foundChangeLog.amountChanged).to.equal(amountChanged);

        expect(foundChangeLog.startingAmount).to.equal(payload.currentInventoryItemQuantity);
        expect(foundChangeLog.endingAmount).to.equal(payload.value);
    });
});
