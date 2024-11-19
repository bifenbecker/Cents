const Model = require('./index');

class StoreTheme extends Model {
    static get tableName() {
        return 'storeThemes';
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
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },

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
        };
    }
}

module.exports = exports = StoreTheme;
