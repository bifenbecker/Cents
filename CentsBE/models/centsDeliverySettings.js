const Model = require('./index');
class CentsDeliverySettings extends Model {
    static get tableName() {
        return 'centsDeliverySettings';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Store = require('./store');
        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = CentsDeliverySettings;
