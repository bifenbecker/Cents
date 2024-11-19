const Model = require('./index');
class StoreSettings extends Model {
    static get tableName() {
        return 'storeSettings';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Store = require('./store');
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
            deliveryTier: {
				relation: Model.BelongsToOneRelation,
				modelClass: PricingTier,
				join: {
					from: `${this.tableName}.deliveryTierId`,
					to: `${PricingTier.tableName}.id`,
				},
			}
        };
    }
}

module.exports = exports = StoreSettings;
