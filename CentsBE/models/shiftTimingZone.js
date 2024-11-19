const Model = require('./index');

class ShiftTimingZone extends Model {
    static get tableName() {
        return 'shiftTimingZones';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings() {
        const Timing = require('./timings');

        return {
            timings: {
                relation: Model.BelongsToOneRelation,
                modelClass: Timing,
                join: {
                    from: `${this.tableName}.timingId`,
                    to: `${Timing.tableName}.id`,
                },
            },
        };
    }

    getTiming() {
        return this.$relatedQuery('timingId');
    }
}

module.exports = ShiftTimingZone;
