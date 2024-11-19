const { factory } = require('factory-girl');
const TaskTimings = require('../../models/taskTimings');

require('./tasks');
require('./timings');

factory.define('taskTimings', TaskTimings, {
    taskId: factory.assoc('task', 'id'),
    isDeleted: false,
    timingsId: factory.assoc('timing', 'id'),
});

module.exports = exports = factory;
