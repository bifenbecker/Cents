require('dotenv').config();

const router = require('express').Router();

const getEsdReaderForStore = require('./getEsdReaderForStore');
const getCardReaderStatus = require('./getCardReaderStatus');
const getCardBalance = require('./getCardBalance');
const updateCardBalance = require('./updateCardBalance');

router.get('/card-reader', getEsdReaderForStore);
router.post('/card-reader/status', getCardReaderStatus);
router.post('/card/balance/index', getCardBalance);
router.post('/card/balance/update', updateCardBalance);

module.exports = exports = router;
