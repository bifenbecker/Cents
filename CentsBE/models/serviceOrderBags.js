const Model = require('./index');

class ServiceOrderBags extends Model {
    static get tableName() {
        return 'serviceOrderBags';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const ServiceOrders = require('./serviceOrders');

        return {
            serviceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrders,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrders.tableName}.id`,
                },
            },
        };
    }
}

module.exports = ServiceOrderBags;
