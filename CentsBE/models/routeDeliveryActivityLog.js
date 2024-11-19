const Model = require('./index');

class RouteDeliveryActivityLog extends Model {
    static get tableName() {
        return 'routeDeliveryActivityLogs';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const RouteDelivery = require('./routeDeliveries');
        const TeamMember = require('./teamMember');

        return {
            routeDelivery: {
                relation: Model.BelongsToOneRelation,
                modelClass: RouteDelivery,
                join: {
                    from: `${this.tableName}.routeDeliveryId`,
                    to: `${RouteDelivery.tableName}.id`,
                },
            },
            driver: {
                relation: Model.BelongsToOneRelation,
                modelClass: TeamMember,
                join: {
                    from: `${this.tableName}.driverId`,
                    to: `${TeamMember.tableName}.id`,
                },
            },
        };
    }
}

module.exports = RouteDeliveryActivityLog;
