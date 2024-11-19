const { factory } = require('factory-girl');
const TeamMember = require('../../models/teamMember');
require('./users');
require('./laundromatBusinesses');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

factory.define(FACTORIES_NAMES.teamMember, TeamMember, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    userId: factory.assoc('user', 'id'),
    employeeCode: factory.chance('integer', { min: 1000, max: 9999 }),
});

module.exports = exports = factory;
