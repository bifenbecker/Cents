const Model = require('./index');

class InventoryCategory extends Model {
    static get tableName() {
        return 'inventoryCategories';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Business = require('./laundromatBusiness');
        const Inventory = require('./inventory');
        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
            inventory: {
                relation: Model.HasManyRelation,
                modelClass: Inventory,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Inventory.tableName}.categoryId`,
                },
            },
        };
    }
}

module.exports = InventoryCategory;
