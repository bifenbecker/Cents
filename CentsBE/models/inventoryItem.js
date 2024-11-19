const Model = require('./index');

class InventoryItem extends Model {
    static get tableName() {
        return 'inventoryItems';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        if (this.isDeleted) {
            this.deletedAt = new Date().toISOString();
        }
        this.updatedAt = new Date().toISOString();
    }

    static get relationMappings() {
        const Inventory = require('./inventory');
        const ServiceReferenceItem = require('./serviceReferenceItem');
        const Store = require('./store');
        const InventoryOrderItem = require('./inventoryOrderItems');
        const ServiceReferenceItemDetail = require('./serviceReferenceItemDetail');
        const InventoryChangeLog = require('./inventoryChangeLog');
        const PricingTier = require('./pricingTier');
        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
            inventory: {
                relation: Model.BelongsToOneRelation,
                modelClass: Inventory,
                join: {
                    from: `${this.tableName}.inventoryId`,
                    to: `${Inventory.tableName}.id`,
                },
            },
            referenceItems: {
                relation: Model.HasManyRelation,
                modelClass: ServiceReferenceItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItem.tableName}.inventoryItemId`,
                },
            },
            inventoryLineItems: {
                relation: Model.HasManyRelation,
                modelClass: InventoryOrderItem,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventoryOrderItem.tableName}.inventoryItemId`,
                },
            },
            serviceLineItems: {
                relation: Model.HasManyRelation,
                modelClass: ServiceReferenceItemDetail,
                filter(builder) {
                    builder.where('soldItemType', 'InventoryItem');
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceReferenceItemDetail.tableName}.soldItemId`,
                },
            },
            inventoryChanges: {
                relation: Model.HasManyRelation,
                modelClass: InventoryChangeLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${InventoryChangeLog.tableName}.inventoryItemId`,
                },
            },
            pricingTier: {
				relation: Model.BelongsToOneRelation,
				modelClass: PricingTier,
				join: {
					from: `${this.tableName}.pricingTierId`,
					to: `${PricingTier.tableName}.id`,
				},
			}
        };
    }
}

module.exports = exports = InventoryItem;
