const Model = require('./index');

class Refund extends Model {
    static get tableName() {
        return 'refunds';
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
        const Payment = require('./payment');
        const Order = require('./orders');

        return {
            payment: {
                relation: Model.BelongsToOneRelation,
                modelClass: Payment,
                join: {
                    from: `${this.tableName}.paymentId`,
                    to: `${Payment.tableName}.id`,
                },
            },
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: Order,
                join: {
                    from: `${this.tableName}.orderId`,
                    to: `${Order.tableName}.id`,
                },
            },
        };
    }
}

module.exports = Refund;
