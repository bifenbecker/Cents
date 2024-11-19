const Model = require('./index');

class SpyderWashSettings extends Model {
    static get tableName() {
        return 'spyderWashSettings';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        this.createdAt = new Date().toISOString();
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

module.exports = exports = SpyderWashSettings;
