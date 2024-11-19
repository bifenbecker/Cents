const Model = require('./index');

class Task extends Model {
    static get tableName() {
        return 'tasks';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const TaskTimings = require('./taskTimings');
        const Timings = require('./timings');
        const Business = require('./laundromatBusiness');
        const TaskLogs = require('./taskLogs');

        return {
            timings: {
                relation: Model.ManyToManyRelation,
                modelClass: Timings,
                join: {
                    from: `${this.tableName}.id`,
                    through: {
                        from: `${TaskTimings.tableName}.taskId`,
                        to: `${TaskTimings.tableName}.timingsId`,
                    },
                    to: `${Timings.tableName}.id`,
                },
            },

            laundromatBusiness: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${this.tableName}.businessId`,
                    to: `${Business.tableName}.id`,
                },
            },
            taskTimings: {
                relation: Model.HasManyRelation,
                modelClass: TaskTimings,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TaskTimings.tableName}.taskId`,
                },
            },
        };
    }
}

module.exports = Task;
