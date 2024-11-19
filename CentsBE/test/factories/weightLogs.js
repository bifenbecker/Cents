const { factory } = require('factory-girl');
const WeightLogs = require('../../models/weightLog');
require('./serviceOrderItems');
require('./teamMembers');

factory.define('weightLog', WeightLogs, {
    orderItemId: factory.assoc('serviceOrderItem', 'id'),
    step: 1,
    weight: 13.00,
    teamMemberId: factory.assoc('teamMember', 'id'),
});

module.exports = exports = factory;
