const { factory } = require('factory-girl');
const faker = require('faker');
const PricingTier = require('../../models/pricingTier');
require('./laundromatBusinesses');

factory.define('pricingTiers', PricingTier, {
    name: faker.random.word(),
    type: 'COMMERCIAL',
    businessId: factory.assoc('laundromatBusiness', 'id')
});

factory.extend('pricingTiers', 'pricingTierDelivery', {
    type: 'DELIVERY'
});

factory.extend('pricingTiers', 'commercialPricingTier', {
    type: 'COMMERCIAL',
});

module.exports = exports = factory;
