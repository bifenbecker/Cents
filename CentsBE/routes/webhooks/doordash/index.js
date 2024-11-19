const router = require('express').Router();

const { updateDoorDashDeliveryStatus } = require('./doorDashWebhookController');

router.post('/status/update', updateDoorDashDeliveryStatus);

module.exports = exports = router;
