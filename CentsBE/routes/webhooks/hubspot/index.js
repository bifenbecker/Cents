const router = require('express').Router();

const { createBusinessInformation } = require('./hubspotWebhookController');

router.post('/company/create', createBusinessInformation);

module.exports = exports = router;
