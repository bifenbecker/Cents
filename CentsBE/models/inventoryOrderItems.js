const Model = require('./index');

class InventoryOrderItem extends Model {
    static get tableName() {
        return 'inventoryOrderLineItems';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const InventoryOrder = require('./inventoryOrders');
        const InventoryItem = require('./inventoryItem');
        return {
            inventoryOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: InventoryOrder,
                join: {
                    from: `${this.tableName}.inventoryOrderId`,
                    to: `${InventoryOrder.tableName}.id`,
                },
            },
            inventoryItem: {
                relation: Model.BelongsToOneRelation,
                modelClass: InventoryItem,
                join: {
                    from: `${this.tableName}.inventoryItemId`,
                    to: `${InventoryItem.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = InventoryOrderItem;
