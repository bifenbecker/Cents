const BaseServiceOrderBuilder = require('./baseItemBuilder');

class DeleteItemBuilder extends BaseServiceOrderBuilder {
    constructor(item) {
        super(item, null, null);
    }

    buildItemAttributes() {
        this.newItem.id = this.item.orderItemId;
        this.newItem.deletedAt = new Date().toISOString();
    }

    buildReferenceItem() {
        this.newItem.referenceItems = {
            id: this.item.referenceItemId,
            deletedAt: new Date().toISOString(),
        };
    }

    buildLineItemDetails() {
        this.newItem.referenceItems.lineItemDetail = {
            id: this.item.serviceReferenceItemDetailsId,
            deletedAt: new Date().toISOString(),
        };
    }

    inventoryObj() {
        return {
            changeInQuantity: this.item.quantity,
            inventoryItemId: this.item.inventoryId,
        };
    }

    isInventory() {
        return this.item.inventoryId !== null;
    }
}
module.exports = exports = DeleteItemBuilder;
