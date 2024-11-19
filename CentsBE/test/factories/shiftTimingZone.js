const { factory } = require('factory-girl');
const ShiftTimeZone = require('../../models/shiftTimingZone');
require('./timings');
require('./zones');

factory.define('shiftTimingZone', ShiftTimeZone, {
    timingId: factory.assoc('timing', 'id'),
    zoneIds: [],
});
module.exports = exports = factory;
