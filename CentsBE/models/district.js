const Model = require('./index');

class District extends Model {
    static get tableName() {
        return 'districts';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Region = require('./region');
        const Store = require('./store');

        return {
            stores: {
                relation: Model.HasManyRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Store.tableName}.districtId`,
                },
            },

            region: {
                relation: Model.BelongsToOneRelation,
                modelClass: Region,
                join: {
                    from: `${this.tableName}.regionId`,
                    to: `${Region.tableName}.id`,
                },
            },
        };
    }

    getStores() {
        return this.$relatedQuery('stores');
    }

    getRegion() {
        return this.$relatedQuery('region');
    }
}

module.exports = District;
