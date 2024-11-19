const { factory } = require('factory-girl');
const OrderActivityLog = require('../../models/orderActivityLog');

require('./teamMembers');
require('./serviceOrders');

factory.define('orderActivityLog', OrderActivityLog, {
    orderId: factory.assoc('serviceOrder', 'id'),
    teamMemberId: factory.assoc('teamMember', 'id'),
    status: 'READY_FOR_PROCESSING',
});

module.exports = exports = factory;
