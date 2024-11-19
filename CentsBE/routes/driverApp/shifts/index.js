const router = require('express').Router();

const stops = require('./stops');
const stopsValidation = require('../../../validations/driverApp/stops');

router.use('/:shiftTimingId/stops', stopsValidation, stops);

module.exports = exports = router;
