const Model = require('./index');

class ServicePrices extends Model {
    static get tableName() {
        return 'servicePrices';
    }

    static get idColumn() {
        return 'id';
    }

    //hook to update updatedAt column value.
    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

	static get relationMappings() {
		const Services = require("./services");
		const Store = require("./store");
		const PricingTier = require('./pricingTier');
		return {
			service: {
				relation: Model.BelongsToOneRelation,
				modelClass: Services,
				join: {
					from: `${this.tableName}.serviceId`,
					to: `${Services.tableName}.id`,
				},
			},
			store: {
				relation: Model.BelongsToOneRelation,
				modelClass: Store,
				join: {
					from: `${this.tableName}.storeId`,
					to: `${Store.tableName}.id`,
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

module.exports = ServicePrices;
