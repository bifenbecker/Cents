const { factory } = require('factory-girl');
const CashOutEvent = require('../../models/cashOutEvent');

// factory associations
require('./stores');
require('./teamMembers');

factory.define('cashOutEvent', CashOutEvent, {
    storeId: factory.assoc('store', 'id'),
    teamMemberId: factory.assoc('teamMember', 'id'),
    employeeCode: factory.chance('integer', { min: 1000, max: 9999 }),
    employeeName: factory.chance('name'),
    totalCashChanged: 1000,
    amountLeftInDrawer: 2000,
    totalCashPaymentSum: 0,
    type: 'IN',
    createdAt: new Date().toISOString(),
});

module.exports = exports = factory;
