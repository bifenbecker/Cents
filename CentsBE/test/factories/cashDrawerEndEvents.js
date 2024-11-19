const { factory } = require('factory-girl');
const CashDrawerEndEvent = require('../../models/cashDrawerEndEvent');

// factory associations
require('./stores');
require('./teamMembers');

factory.define('cashDrawerEndEvent', CashDrawerEndEvent, {
    storeId: factory.assoc('store', 'id'),
    teamMemberId: factory.assoc('teamMember', 'id'),
    employeeCode: factory.chance('integer', { min: 1000, max: 9999 }),
    employeeName: factory.chance('name'),
    cashSalesAmount: 1000,
    cashRefundAmount: 0,
    expectedInDrawer: 2000,
    actualInDrawer: 2000,
    createdAt: new Date().toISOString(),
});

module.exports = exports = factory;
