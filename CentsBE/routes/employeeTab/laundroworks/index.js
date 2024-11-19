const router = require('express').Router();

// Controller methods
const { processLaundroworksPayment } = require('./laundroworksController');

router.post('/payment/process', processLaundroworksPayment);

module.exports = exports = router;
