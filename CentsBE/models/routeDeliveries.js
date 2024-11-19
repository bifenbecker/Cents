const Model = require('./index');

class RouteDelivery extends Model {
    static get tableName() {
        return 'routeDeliveries';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    }

    static get relationMappings() {
        const Route = require('./route');
        const RouteDeliveryActivityLog = require('./routeDeliveryActivityLog');
        const ServiceOrderRouteDelivery = require('./serviceOrderRouteDeliveries');
        const OrderDelivery = require('./orderDelivery');
        const Store = require('./store');

        return {
            route: {
                relation: Model.BelongsToOneRelation,
                modelClass: Route,
                join: {
                    from: `${this.tableName}.routeId`,
                    to: `${Route.tableName}.id`,
                },
            },
            routeDeliveryActivityLogs: {
                relation: Model.HasManyRelation,
                modelClass: RouteDeliveryActivityLog,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${RouteDeliveryActivityLog.tableName}.routeDeliveryId`,
                },
            },
            serviceOrderRouteDeliveries: {
                relation: Model.HasManyRelation,
                modelClass: ServiceOrderRouteDelivery,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ServiceOrderRouteDelivery.tableName}.routeDeliveryId`,
                },
            },
            orderDelivery: {
                relation: Model.BelongsToOneRelation,
                modelClass: OrderDelivery,
                join: {
                    from: `${this.tableName}.routableId`,
                    to: `${OrderDelivery.tableName}.id`,
                },
            },
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.routableId`,
                    to: `${Store.tableName}.id`,
                },
            },
        };
    }
}

module.exports = RouteDelivery;
