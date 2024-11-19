require('dotenv').config();

const router = require('express').Router();

const authenticate = require('./authenticate');
const getDeliveryEstimate = require('./getDeliveryEstimate');
const createUberDelivery = require('./createUberDelivery');
const getUberDelivery = require('./getUberDelivery');

router.post('/authenticate', authenticate);
router.post('/delivery/estimate', getDeliveryEstimate);
router.post('/delivery/create', createUberDelivery);
router.get('/delivery/:orderDeliveryId', getUberDelivery);

module.exports = exports = router;
