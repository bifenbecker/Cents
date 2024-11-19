const Model = require('./index');

class Inventory extends Model {
    static get tableName() {
        return 'inventory';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const InventoryCategory = require('./inventoryCategory');
        const InventoryItem = require('./inventoryItem');
        return {
            inventoryItems: {
                relation: Model.HasManyRelation,
                modelClass: InventoryItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventoryItem.tableName}.inventoryId`,
                },
            },
            inventoryCategory: {
                relation: Model.BelongsToOneRelation,
                modelClass: InventoryCategory,
                join: {
                    from: `${this.tableName}.categoryId`,
                    to: `${InventoryCategory.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = Inventory;
