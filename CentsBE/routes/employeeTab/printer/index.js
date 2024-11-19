require('dotenv').config();

const router = require('express').Router();

const { savePrinterSettings } = require('./printerController');

router.post('/settings/save', savePrinterSettings);

module.exports = exports = router;
