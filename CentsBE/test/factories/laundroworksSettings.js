const { factory } = require('factory-girl');
const LaundroworksSettings = require('../../models/laundroworksSettings');
require('./stores');

factory.define('laundroworksSettings', LaundroworksSettings, {
    storeId: factory.assoc('store', 'id'),
    username: factory.chance('word'),
    password: factory.chance('word'),
    customerKey: factory.chance('integer').toString(),
    laundroworksLocationId: factory.chance('integer', { min: 0, max: 1000000 }).toString(),
    laundroworksPosNumber: factory.chance('integer', { min: 0, max: 99 }).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

module.exports = exports = factory;
