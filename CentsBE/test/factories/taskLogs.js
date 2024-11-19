const { factory } = require('factory-girl');
const faker = require('faker');
const TaskLogs = require('../../models/taskLogs');

require('./teamMembers');
require('./taskTimings');

factory.define('taskLogs', TaskLogs, {
    teamMemberId: factory.assoc('teamMember', 'id'),
    notes: faker.random.word(),
    taskTimingId: factory.assoc('taskTimings', 'id'),
});

module.exports = exports = factory;
