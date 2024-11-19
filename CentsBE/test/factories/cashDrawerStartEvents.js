const { factory } = require('factory-girl');
const CashDrawerStartEvent = require('../../models/cashDrawerStartEvent');

// factory associations
require('./stores');
require('./teamMembers');

factory.define('cashDrawerStartEvent', CashDrawerStartEvent, {
    storeId: factory.assoc('store', 'id'),
    teamMemberId: factory.assoc('teamMember', 'id'),
    employeeCode: factory.chance('integer', { min: 1000, max: 9999 }),
    employeeName: factory.chance('name'),
    startingCashAmount: 1000,
    createdAt: new Date().toISOString(),
});

module.exports = exports = factory;
