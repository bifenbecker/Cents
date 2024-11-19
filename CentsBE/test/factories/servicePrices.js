const { factory } = require('factory-girl');
const ServicePrice = require('../../models/servicePrices');
require('./stores');
require('./serviceMasters');
require('./pricingTiers');

factory.define('servicePrice', ServicePrice, {
    storeId: factory.assoc('store', 'id'),
    serviceId: factory.assoc('serviceMaster', 'id'),
    minQty: 1,
    minPrice: 10,
    storePrice: 10,
    isDeliverable: false,
});

factory.extend('servicePrice', 'pricingTierServicePrice', {
    pricingTierId: factory.assoc('pricingTiers', 'id'),
});

factory.extend('servicePrice', 'deliverableServicePrice', {
    isDeliverable: true,
});

factory.extend('servicePrice', 'nonDeliverableServicePrice', {
    isDeliverable: false,
});

module.exports = exports = factory;
