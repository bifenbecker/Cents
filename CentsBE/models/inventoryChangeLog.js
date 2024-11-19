const Model = require('./index');

class InventoryChangeLog extends Model {
    static get tableName() {
        return 'inventoryChangeLog';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        if (!this.updatedAt) {
            this.updatedAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const Order = require('./orders');
        const TeamMember = require('./teamMember');
        const InventoryItem = require('./inventoryItem');
        const Store = require('./store');
        const Business = require('./laundromatBusiness');

        return {
            order: {
                relation: Model.HasOneRelation,
                modelClass: Order,
                join: {
                    from: `${this.tableName}.orderId`,
                    to: `${Order.tableName}.id`,
                },
            },

            teamMember: {
                relation: Model.HasOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.teamMemberId`,
                    to: `${TeamMember.tableName}.id`,
                },
            },

            inventoryItem: {
                relation: Model.HasOneRelation,
                modelClass: InventoryItem,
                join: {
                    from: `${this.tableName}.inventoryItemId`,
                    to: `${InventoryItem.tableName}.id`,
                },
            },

            store: {
                relation: Model.HasOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

            business: {
                relation: Model.HasOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
        };
    }
}

module.exports = InventoryChangeLog;
