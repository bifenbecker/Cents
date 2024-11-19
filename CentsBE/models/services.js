const path = require('path');
const Model = require('./index');

class ServicesMaster extends Model {
	static get tableName() {
		return "servicesMaster";
	}
	static get relationMappings() {
		const ServiceCategories = require("./serviceCategories");
		const ServicePrices = require("./servicePrices");
		const ServiceModifier = require('./serviceModifiers');
		const PricingStructure = require('./servicePricingStructure');

		return {
			serviceCategory: {
				relation: Model.BelongsToOneRelation,
				modelClass: ServiceCategories,
				join: {
					from: `${this.tableName}.serviceCategoryId`,
					to: `${ServiceCategories.tableName}.id`,
				},
			},

			prices: {
				relation: Model.HasManyRelation,
				modelClass: ServicePrices,
				join: {
					from: `${this.tableName}.id`,
					to: `${ServicePrices.tableName}.serviceId`,
				},
			},

			serviceModifiers: {
				relation: Model.HasManyRelation,
				modelClass: ServiceModifier,
				join: {
					from: `${this.tableName}.id`,
					to: `${ServiceModifier.tableName}.serviceId`,
				},
			},
			
			pricingStructure: {
				relation: Model.HasOneRelation,
				modelClass: PricingStructure,
				join: {
					from: `${this.tableName}.servicePricingStructureId`,
					to: `${PricingStructure.tableName}.id`,
				},
			},
		};
	}
}

module.exports = exports = ServicesMaster;
