const Model = require('./index');

class TaxRate extends Model {
    static get tableName() {
        return 'taxRates';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Store = require('./store');

        return {
            stores: {
                relation: Model.HasManyRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Store.tableName}.taxRateId`,
                },
            },
        };
    }

    getStores() {
        return this.$relatedQuery('stores');
    }
}

module.exports = exports = TaxRate;
