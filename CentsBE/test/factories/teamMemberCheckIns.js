const { factory } = require('factory-girl');
const TeamMemberCheckIn = require('../../models/teamMemberCheckIn');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./stores');
require('./teamMembers');

factory.define(FACTORIES_NAMES.teamMemberCheckIn, TeamMemberCheckIn, {
    teamMemberId: factory.assoc(FACTORIES_NAMES.teamMember, 'id'),
    storeId: factory.assoc(FACTORIES_NAMES.store, 'id'),
});

module.exports = exports = factory;
