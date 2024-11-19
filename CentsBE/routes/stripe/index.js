require('dotenv').config();

const router = require('express').Router();

const connectionToken = require('./createConnectionToken');
const retrieveLocation = require('./retrieveLocation');
const retrieveReader = require('./retrieveReader');
const createPaymentIntent = require('./createPaymentIntent');
const capturePaymentIntent = require('./capturePaymentIntent');
const confirmPaymentIntent = require('./confirmPaymentIntent');
const subscription = require('./subscription');
const bank = require('./bank');
const terminal = require('./terminal');

// Validations
const createPaymentIntentValidation = require('../../validations/stripe/createPaymentIntentValidation');

router.use('/connectionToken/create', connectionToken);
router.use('/location/get', retrieveLocation);
router.use('/reader/get', retrieveReader);
router.use('/payment/new', createPaymentIntentValidation, createPaymentIntent);
router.use('/payment/capture', capturePaymentIntent);
router.use('/payment/confirm', confirmPaymentIntent);
router.use('/subscription', subscription);
router.use('/bank', bank);
router.use('/terminal', terminal);

module.exports = router;
