const { factory } = require('factory-girl');
const ServicePricingStructure = require('../../models/servicePricingStructure');
const FindOrCreateAdapter = require('../support/findOrCreateAdapter');

factory.define('servicePricingStructure', ServicePricingStructure, {
    type: 'FIXED_PRICE',
});
factory.setAdapter(new FindOrCreateAdapter('type'), 'servicePricingStructure');


module.exports = exports = factory
