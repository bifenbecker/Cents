const Model = require('./index');

class TaskLogs extends Model {
    static get tableName() {
        return 'taskLogs';
    }

    static get idColumn() {
        return 'id';
    }
}

module.exports = TaskLogs;
