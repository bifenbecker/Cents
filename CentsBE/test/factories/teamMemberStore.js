const { factory } = require('factory-girl');
const TeamMemberStore = require('../../models/teamMemberStore');
require('./teamMembers');
require('./stores');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

factory.define(FACTORIES_NAMES.teamMemberStore, TeamMemberStore, {
    teamMemberId: factory.assoc('teamMember', 'id'),
    storeId: factory.assoc('store', 'id'),
});

module.exports = exports = factory;
