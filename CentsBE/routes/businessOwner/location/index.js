const router = require('express').Router();

const assignedLocations = require('./assignedLocations');
const locations = require('./locations');
const getRegionDistrictLocations = require('./getRegionDistrictLocations');

router.get('/assigned', assignedLocations);
router.get('/', locations);
router.get('/regions', getRegionDistrictLocations);

module.exports = exports = router;
