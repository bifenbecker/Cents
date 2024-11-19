const Model = require('./index');

class ServiceOrderRouteDelivery extends Model {
    static get tableName() {
        return 'serviceOrderRouteDeliveries';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const RouteDelivery = require('./routeDeliveries');
        const ServiceOrder = require('./serviceOrders');

        return {
            routeDelivery: {
                relation: Model.BelongsToOneRelation,
                modelClass: RouteDelivery,
                join: {
                    from: `${this.tableName}.routeDeliveryId`,
                    to: `${RouteDelivery.tableName}.id`,
                },
            },
            serviceOrder: {
                relation: Model.BelongsToOneRelation,
                modelClass: ServiceOrder,
                join: {
                    from: `${this.tableName}.serviceOrderId`,
                    to: `${ServiceOrder.tableName}.id`,
                },
            },
        };
    }
}

module.exports = ServiceOrderRouteDelivery;
