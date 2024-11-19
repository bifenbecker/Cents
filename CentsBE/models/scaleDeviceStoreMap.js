const Model = require('./index');

class ScaleDeviceStoreMap extends Model {
    static get tableName() {
        return 'scaleDeviceStoreMap';
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
        const Store = require('./store');
        const ScaleDevice = require('./scaleDevice');

        return {
            store: {
                relation: Model.HasOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

            scaleDevice: {
                relation: Model.HasOneRelation,
                modelClass: ScaleDevice,
                join: {
                    from: `${this.tableName}.scaleDeviceId`,
                    to: `${ScaleDevice.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = ScaleDeviceStoreMap;
