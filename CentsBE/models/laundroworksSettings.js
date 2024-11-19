const Model = require('./index');

class LaundroworksSettings extends Model {
    static get tableName() {
        return 'laundroworksSettings';
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
        const Business = require('./laundromatBusiness');

        return {
            business: {
                relation: Model.HasOneThroughRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.storeId`,
                    through: {
                        from: `${Store.tableName}.id`,
                        to: `${Store.tableName}.businessId`,
                    },
                    to: `${Business.tableName}.id`,
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
        };
    }
}

module.exports = exports = LaundroworksSettings;
