const Model = require('./index');

class RecurringOrderLog extends Model {
    static get tableName() {
        return 'recurringOrderLogs';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeCreate() {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
    }

    static get relationMappings() {
        const ServiceOrder = require('./serviceOrders');
        const RecurringSubscription = require('./recurringSubscription');

        return {
            serviceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },

            clonedFromServiceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.clonedFromId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },
            recurringSubscription: {
                relation: Model.BelongsToOneRelation,
                modelClass: RecurringSubscription,
                join: {
                    from: `${this.tableName}.recurringSubscription`,
                    to: `${RecurringSubscription.tableName}.id`,
                },
            },
        };
    }
}

module.exports = RecurringOrderLog;
