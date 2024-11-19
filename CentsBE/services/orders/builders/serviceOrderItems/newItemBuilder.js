const BaseItemBuilder = require('./baseItemBuilder');

class NewItemBuilder extends BaseItemBuilder {
    constructor(item, orderId, customer, status) {
        super(item, customer, status);
        this.newItem = { orderId };
    }

    inventoryObj() {
        const changeInQuantity = -this.item.count;
        const inventoryItemId = this.item.priceId;
        return { changeInQuantity, inventoryItemId };
    }
}

module.exports = exports = NewItemBuilder;
