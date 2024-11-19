const Model = require('./index');
class OrderActivityLog extends Model {
    static get tableName() {
        return 'orderActivityLog';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    $afterGet() {
        this.isAdjusted = this.notes === 'Order Adjustment';
    }

    static get relationMappings() {
        const Order = require('./serviceOrders');
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

module.exports = exports = OrderActivityLog;
