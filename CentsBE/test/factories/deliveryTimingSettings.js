const { factory } = require('factory-girl');
const DeliveryTimingSettings = require('../../models/deliveryTimingSettings');
const faker = require('faker');
require('./timings');
require('./zones');

factory.define('deliveryTimingSettings', DeliveryTimingSettings, {
    timingsId: factory.assoc('timing', 'id'),
    maxStops: null,
    serviceType: 'ALL'
});

module.exports = exports = factory;
