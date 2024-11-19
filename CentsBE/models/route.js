const Model = require('./index');

class Route extends Model {
    static get tableName() {
        return 'route';
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
        const Store = require('./store');
        const TeamMember = require('./teamMember');
        const Timing = require('./timings');
        const RouteDelivery = require('./routeDeliveries');

        return {
            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
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
            timing: {
                relation: Model.BelongsToOneRelation,
                modelClass: Timing,
                join: {
                    from: `${this.tableName}.timingId`,
                    to: `${Timing.tableName}.id`,
                },
            },
            routeDeliveries: {
                relation: Model.HasManyRelation,
                modelClass: RouteDelivery,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${RouteDelivery.tableName}.routeId`,
                },
            },
        };
    }
}

module.exports = Route;
