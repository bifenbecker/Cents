const Model = require('./index');

class Payment extends Model {
    static get tableName() {
        return 'payments';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Store = require('./store');
        const Order = require('./orders');
        const User = require('./user');

        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
            orders: {
                relation: Model.BelongsToOneRelation,
                modelClass: Order,
                join: {
                    from: `${this.tableName}.orderId`,
                    to: `${Order.tableName}.id`,
                },
            },
            customer: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${this.tableName}.customerId`,
                    to: `${User.tableName}.id`,
                },
            },
            paymentRefunds: {
                filter(builder) {
                    builder.where('status', 'refunded');
                },
                relation: Model.HasManyRelation,
                modelClass: Payment,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${this.tableName}.parentId`,
                },
            },
        };
    }
}

module.exports = Payment;
