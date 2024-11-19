const Model = require('./index');

class WashService extends Model {
    static get tableName() {
        return 'washServices';
    }
    static get relationMappings() {
        const Pricing = require('./pricePerPound');

        return {
            prices: {
                relation: Model.HasManyRelation,
                modelClass: Pricing,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Pricing.tableName}.washServiceId`,
                },
            },
        };
    }
}

module.exports = exports = WashService;
