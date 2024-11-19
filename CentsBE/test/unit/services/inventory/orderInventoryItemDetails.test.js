require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const orderInventoryItemDetails = require('../../../../services/inventory/orderInventoryItemDetails');

describe('test orderInventoryItemDetails', () => {
    let serviceOrder, serviceOrderItem, serviceReferenceItem;

    beforeEach(async () => {
        const store = await factory.create(FN.store);
        serviceOrder = await factory.create(FN.serviceOrder, {
            storeId: store.id,
        });
        inventoryItem = await factory.create(FN.inventoryItem, {
            storeId: store.id,
        });
        serviceOrderItem = await factory.create(FN.serviceOrderItem, {
            orderId: serviceOrder.id,
        });
        serviceReferenceItem = await factory.create(FN.serviceReferenceItem, {
            orderItemId: serviceOrderItem.id,
            inventoryItemId: inventoryItem.id,
        });
    });

    it('should return inventoryItemDetails', async () => {
        const inventoryItemDetails = await orderInventoryItemDetails(serviceOrder.id, inventoryItem.id);

        expect(inventoryItemDetails).to.have.property('id').to.equal(serviceOrderItem.id);
        expect(inventoryItemDetails).to.have.property('orderId').to.equal(serviceOrder.id);
        expect(inventoryItemDetails).to.have.property('referenceItems').to.not.be.empty;
        expect(inventoryItemDetails.referenceItems.length).to.equal(1);
        expect(inventoryItemDetails.referenceItems[0]).to.have.property('id').to.equal(serviceReferenceItem.id);
        expect(inventoryItemDetails.referenceItems[0]).to.have.property('orderItemId').to.equal(serviceOrderItem.id);
    });

    it('should fail if orderId is null', async () => {
        const orderId = null;
        expect(orderInventoryItemDetails(orderId, inventoryItem.id)).to.be.rejected;
    });

    it('should fail if inventoryItemId is null', async () => {
        const inventoryItemId = null;
        expect(orderInventoryItemDetails(serviceOrder.id, inventoryItemId)).to.be.rejected;
    });
});
