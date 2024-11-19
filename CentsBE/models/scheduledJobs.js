const Model = require('./index');

class ScheduledJob extends Model {
    static get tableName() {
        return 'scheduledJobs';
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
        const OrderDelivery = require('./orderDelivery');

        return {
            orderDeliveryJobs: {
                relation: Model.HasOneRelation,
                modelClass: OrderDelivery,
                filter(builder) {
                    builder.whereIn(`${this.tableName}.scheduledJobForType`, ['OrderDelivery']);
                },
                join: {
                    from: `${this.tableName}.scheduledJobForId`,
                    to: `${OrderDelivery.tableName}.id`,
                },
            },
        };
    }
}

module.exports = exports = ScheduledJob;
