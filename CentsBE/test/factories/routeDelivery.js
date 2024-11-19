const { factory } = require('factory-girl');
const RouteDelivery = require('../../models/routeDeliveries');
const faker = require('faker');

require('./route');
require('./orderDeliveries');
require('./stores');

factory.define('routeDelivery', RouteDelivery, {
    routeId: factory.assoc('route', 'id'),
    eta: 1620410497,
    status: 'ASSIGNED',
});

factory.extend('routeDelivery', 'orderDeliveryRouteDelivery', {
    routableId: factory.assoc('orderDelivery', 'id'),
    routableType: 'OrderDelivery',
});

factory.extend('routeDelivery', 'storeRouteDelivery', {
    routableId: factory.assoc('store', 'id'),
    routableType: 'Store',
});

module.exports = exports = factory;
