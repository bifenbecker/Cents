const router = require('express').Router();
const list = require('./list');
const getShiftsForStore = require('./getShiftsForStore');

router.get('/', list);
router.get('/:storeId/shifts', getShiftsForStore);

module.exports = exports = router;
