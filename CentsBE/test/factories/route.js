const { factory } = require('factory-girl');
const Route = require('../../models/route');
require('./teamMembers');
require('./stores');
require('./timings');

factory.define('route', Route, {
    driverId: factory.assoc('teamMember', 'id'),
    storeId: factory.assoc('store', 'id'),
    timingId: factory.assoc('timing', 'id'),
    status: 'STARTED',
});

module.exports = exports = factory;
