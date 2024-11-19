const Model = require('./index');

class SubscriptionProduct extends Model {
    static get tableName() {
        return 'subscriptionProducts';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Business = require('./laundromatBusiness');

        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = SubscriptionProduct;
