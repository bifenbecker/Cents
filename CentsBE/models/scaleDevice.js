const Model = require('./index');

class ScaleDevice extends Model {
    static get tableName() {
        return 'scaleDevices';
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
        const ScaleDeviceStoreMap = require('./scaleDeviceStoreMap');

        return {
            store: {
                relation: Model.HasOneThroughRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${ScaleDeviceStoreMap.tableName}.scaleDeviceId`,
                        to: `${ScaleDeviceStoreMap.tableName}.storeId`,
                    },
                    to: `${Store.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = ScaleDevice;
