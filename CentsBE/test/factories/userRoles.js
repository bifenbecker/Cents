const { factory } = require('factory-girl');
const UserRole = require('../../models/userRoles');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

require('./roles');
require('./users');

factory.define(FACTORIES_NAMES.userRole, UserRole, {
    userId: factory.assoc('user', 'id'),
    roleId: factory.assoc('role', 'id'),
});

module.exports = exports = factory;
