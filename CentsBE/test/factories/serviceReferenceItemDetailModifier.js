const { factory } = require('factory-girl');
const ServiceReferenceItemDetailModifier = require('../../models/serviceReferenceItemDetailModifier');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./serviceReferenceItemDetail');
require('./modifiers');

factory.define(FN.serviceReferenceItemDetailModifier, ServiceReferenceItemDetailModifier, {
    serviceReferenceItemDetailId: factory.assoc('serviceReferenceItemDetailForServicePrices', 'id'),
    modifierId: factory.assoc('modifier', 'id'),
    modifierName: factory.chance('word'),
    unitCost: factory.chance('integer', { min: 1, max: 100 }),
    quantity: factory.chance('integer', { min: 1, max: 10 }),
    totalCost: factory.chance('integer', { min: 1, max: 100 }),
    modifierPricingType: factory.chance('pickone', ['FIXED_PRICE', 'PER_POUND']),
});

module.exports = exports = factory;
