const Model = require('./index');

class TaskTimings extends Model {
    static get tableName() {
        return 'taskTimings';
    }

    static get idColumn() {
        return 'id';
    }
    static get relationMappings() {
        const TaskLogs = require('./taskLogs');
        return {
            taskLogs: {
                relation: Model.BelongsToOneRelation,
                modelClass: TaskLogs,
                join: {
                    from: `${this.tableName}.id`,
                    to: `${TaskLogs.tableName}.taskTimingId`,
                },
            },
        };
    }
}

module.exports = TaskTimings;
