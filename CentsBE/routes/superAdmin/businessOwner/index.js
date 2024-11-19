const router = require('express').Router();

const businessOwnerListing = require('./businessOwnerListing');
const batches = require('./batches');
const devices = require('./devices');

router.get('/', businessOwnerListing);
router.get('/:businessId/batches', batches);
router.get('/:businessId/devices', devices);
module.exports = exports = router;
