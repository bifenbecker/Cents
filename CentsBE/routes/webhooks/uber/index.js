const router = require('express').Router();

const { updateDeliveryStatus } = require('./uberWebhookController');

router.post('/status/update', updateDeliveryStatus);

module.exports = exports = router;
