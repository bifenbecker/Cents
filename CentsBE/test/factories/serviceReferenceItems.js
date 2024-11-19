const { factory } = require('factory-girl');
const ServiceReferenceItem = require('../../models/serviceReferenceItem');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./servicePrices');
require('./serviceOrderItems');
require('./serviceMasters');
require('./serviceOrderItems');

factory.define(FN.serviceReferenceItem, ServiceReferenceItem, {
    quantity: 1,
    unitCost: 10,
    servicePriceId: factory.assoc('servicePrice', 'id'),
    orderItemId: factory.assoc('serviceOrderItem', 'id'),
    serviceId: factory.assoc('serviceMaster', 'id'),
});

module.exports = exports = factory;
