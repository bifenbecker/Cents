const BaseServiceOrderBuilder = require('./baseItemBuilder');

class EditItemBuilder extends BaseServiceOrderBuilder {
    constructor(currentItem, item, customer, status) {
        super(item, customer, status);
        this.currentItem = currentItem;
        this.newItem = {
            id: currentItem.orderItemId,
        };
    }

    buildReferenceItem() {
        super.buildReferenceItem();
        this.newItem.referenceItems.id = this.currentItem.referenceItemId;
    }

    buildLineItemDetails() {
        super.buildLineItemDetails();
        this.newItem.referenceItems.lineItemDetail.id =
            this.currentItem.serviceReferenceItemDetailsId;
    }

    inventoryObj() {
        const changeInQuantity = this.currentItem.quantity - this.item.count;
        const inventoryItemId = this.item.priceId;
        return { changeInQuantity, inventoryItemId };
    }
}

module.exports = exports = EditItemBuilder;
