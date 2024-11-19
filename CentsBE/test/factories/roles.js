const { factory } = require('factory-girl');
const Role = require('../../models/role');
const FindOrCreateAdapter = require('../support/findOrCreateAdapter');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

factory.define(FACTORIES_NAMES.role, Role, {
    userType: 'Employee',
});

factory.setAdapter(new FindOrCreateAdapter('userType'), 'role');

module.exports = exports = factory;
