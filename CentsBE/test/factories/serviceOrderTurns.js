const { factory } = require('factory-girl');
const ServiceOrderTurn = require('../../models/serviceOrderTurn');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./turns');
require('./serviceOrders');

factory.define(FN.serviceOrderTurns, ServiceOrderTurn, {
    serviceOrderId: factory.assoc(FN.serviceOrder, 'id'),
    turnId: factory.assoc(FN.turn, 'id'),
});

module.exports = exports = factory;
