const { factory } = require('factory-girl');
const ServiceOrderWeights = require('../../models/serviceOrderWeights');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./serviceReferenceItems');
require('./teamMembers');
require('./serviceOrders');

factory.define(FN.serviceOrderWeight, ServiceOrderWeights, {
    step: 1,
    teamMemberId: factory.assoc('teamMember', 'id'),
    totalWeight: 10.0,
    chargeableWeight: 10.0,
    serviceOrderId: factory.assoc('serviceOrder', 'id'),
    editedBy: factory.assoc('teamMember', 'id'),
    adjustedBy: factory.assoc('teamMember', 'id'),
});

module.exports = exports = factory;
