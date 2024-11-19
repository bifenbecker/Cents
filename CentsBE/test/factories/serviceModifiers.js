const { factory } = require('factory-girl');
const ServiceModifier = require('../../models/serviceModifiers');
require('./serviceMasters');
require('./modifiers');

factory.define('serviceModifier', ServiceModifier, {
    serviceId: factory.assoc('serviceMaster', 'id'),
    modifierId: factory.assoc('modifier', 'id'),
    isFeatured: true,
});

module.exports = exports = factory;
