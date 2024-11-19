const Model = require('./index');

class Timing extends Model {
    static get tableName() {
        return 'timings';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const TaskTimings = require('./taskTimings');
        const Tasks = require('./tasks');
        const Shift = require('./shifts');
        const Route = require('./route');
        const ShiftTimingZone = require('./shiftTimingZone');
        const DeliveryTimingSettings = require('./deliveryTimingSettings');

        return {
            tasks: {
                relation: Model.ManyToManyRelation,
                modelClass: Tasks,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${TaskTimings.tableName}.timingsId`,
                        to: `${TaskTimings.tableName}.taskId`,
                    },
                    to: `${Tasks.tableName}.id`,
                },
            },

            shift: {
                relation: Model.BelongsToOneRelation,
                modelClass: Shift,
                join: {
                    from: `${this.tableName}.shiftId`,
                    to: `${Shift.tableName}.id`,
                },
            },
            taskTimings: {
                relation: Model.BelongsToOneRelation,
                modelClass: TaskTimings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TaskTimings.tableName}.timingsId`,
                },
            },
            routes: {
                relation: Model.HasManyRelation,
                modelClass: Route,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Route.tableName}.timingId`,
                },
            },
            shiftTimingZone: {
                relation: Model.HasOneRelation,
                modelClass: ShiftTimingZone,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${ShiftTimingZone.tableName}.timingId`,
                },
            },
            deliveryTimingSettings: {
                relation: Model.HasOneRelation,
                modelClass: DeliveryTimingSettings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${DeliveryTimingSettings.tableName}.timingsId`
                }
            },
        }
    }
}

module.exports = Timing;
