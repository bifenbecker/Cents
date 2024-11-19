const Model = require('./index');
class OwnDeliverySettings extends Model {
    static get tableName() {
        return 'ownDeliverySettings';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Store = require('./store');
        const Zone = require('./zone');
        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
            zones: {
                relation: Model.HasManyRelation,
                modelClass: Zone,
                filter(builder) {
                    builder.where('deletedAt', null);
                },
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Zone.tableName}.ownDeliverySettingsId`,
                },
            },
        };
    }
}

module.exports = exports = OwnDeliverySettings;
