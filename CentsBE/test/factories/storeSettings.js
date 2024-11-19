const { factory } = require('factory-girl');
const StoreSettings = require('../../models/storeSettings');
const faker = require('faker');

require('./stores');
require('./pricingTiers');
require('./servicePrices');

factory.define('storeSetting', StoreSettings, {
    lat: faker.address.latitude(),
    lng: faker.address.longitude(),
    storeId: factory.assoc('store', 'id'),
    timeZone: 'America/Los_Angeles',
});

factory.extend('storeSetting', 'storeSettingWithDeliveryTier', {
    deliveryTierId: factory.assoc('pricingTierDelivery', 'id'),
    deliveryPriceType: 'RETAIL',
});

module.exports = exports = factory;
