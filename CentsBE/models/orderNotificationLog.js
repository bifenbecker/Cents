const Model = require('./index');
class OrderNotificationLog extends Model {
    static get tableName() {
        return 'orderNotificationLogs';
    }
    static get relationMappings() {
        const Language = require('./language');
        const ServiceOrder = require('./serviceOrders');
        return {
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.orderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },
            language: {
                relation: Model.BelongsToOneRelation,
                modelClass: Language,
                join: {
                    from: `${this.tableName}.languageId`,
                    to: `${Language.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = OrderNotificationLog;
