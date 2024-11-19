require('dotenv').config();

const router = require('express').Router();
const stripe = require('./stripe');
const uber = require('./uber');
const hubspot = require('./hubspot');
const doordash = require('./doordash');

router.use('/stripe', stripe);
router.use('/uber', uber);
router.use('/hubspot', hubspot);
router.use('/doordash', doordash); // TODO: setup authorization(token validation) for doordash webhook events

module.exports = exports = router;
