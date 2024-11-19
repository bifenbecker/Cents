const Model = require('./index');

class ServiceOrderRecurringSubscription extends Model {
    static get tableName() {
        return 'serviceOrderRecurringSubscriptions';
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
        const ServiceOrder = require('./serviceOrders');
        const RecurringSubscription = require('./recurringSubscription');
        const ServicePrices = require('./servicePrices');

        return {
            serviceOrder: {
                relation: Model.HasOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },

            recurringSubscription: {
                relation: Model.BelongsToOneRelation,
                modelClass: RecurringSubscription,
                join: {
                    from: `${this.tableName}.recurringSubscriptionId`,
                    to: `${RecurringSubscription.tableName}.id`,
                },
            },
        };
    }
}

module.exports = ServiceOrderRecurringSubscription;
