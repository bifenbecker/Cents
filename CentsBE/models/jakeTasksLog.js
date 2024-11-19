const Model = require('./index');

class JakeTasksLog extends Model {
    static get tableName() {
        return 'jakeTasksLog';
    }
}

module.exports = exports = JakeTasksLog;
