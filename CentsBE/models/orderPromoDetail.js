const Model = require('./index');

class OrderPromoDetail extends Model {
    static get tableName() {
        return 'orderPromoDetails';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Order = require('./orders');

        return {
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

module.exports = OrderPromoDetail;
