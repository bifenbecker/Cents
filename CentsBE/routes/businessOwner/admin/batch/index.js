const router = require('express').Router();

const addLocation = require('./assignLocation');
const batchList = require('./batchList');
const devices = require('./fetchBatchDevices');

router.post('/', addLocation);
router.get('/', batchList);
router.get('/devices', devices);

module.exports = router;
