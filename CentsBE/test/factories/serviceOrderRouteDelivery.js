const { factory } = require('factory-girl');
const ServiceOrderRouteDelivery = require('../../models/serviceOrderRouteDeliveries');

require('./routeDelivery');
require('./serviceOrders');

factory.define('serviceOrderRouteDelivery', ServiceOrderRouteDelivery, {
    routeDeliveryId: factory.assoc('storeRouteDelivery', 'id'),
    serviceOrderId: factory.assoc('serviceOrder', 'id'),
    type: 'TO_HUB',
    status: 'ASSIGNED',
});

module.exports = exports = factory;
