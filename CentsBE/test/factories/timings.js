const { factory } = require('factory-girl');
const Timings = require('../../models/timings');
require('./shifts');

factory.define('timing', Timings, {
    day: '1',
    isActive: true,
    shiftId: factory.assoc('shift', 'id'),
    startTime: 'Tue Sep 21 2021 19:19:58',
    endTime: 'Tue Sep 21 2021 20:19:58',
});

module.exports = exports = factory;
