const Model = require('./index');

class Zone extends Model {
    static get tableName() {
        return 'zones';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const OwnDeliverySettings = require('./ownDeliverySettings');
        const PricingTier = require('./pricingTier');

        return {
            ownDeliverySettings: {
                relation: Model.BelongsToOneRelation,
                modelClass: OwnDeliverySettings,
                join: {
                    from: `${this.tableName}.ownDeliverySettingsId`,
                    to: `${OwnDeliverySettings.tableName}.id`,
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

    getOwnDeliverySettings() {
        return this.$relatedQuery('ownDeliverySettingsId');
    }
}

module.exports = Zone;
