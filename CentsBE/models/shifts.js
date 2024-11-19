const Model = require('./index');

class Shift extends Model {
    static get tableName() {
        return 'shifts';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const Timing = require('./timings');
        const Store = require('./store');

        return {
            timings: {
                relation: Model.HasManyRelation,
                modelClass: Timing,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${Timing.tableName}.shiftId`,
                },
            },

            store: {
                relation: Model.BelongsToOneRelation,
                modelClass: Store,
                join: {
                    from: `${this.tableName}.storeId`,
                    to: `${Store.tableName}.id`,
                },
            },
        };
    }
}

module.exports = Shift;
