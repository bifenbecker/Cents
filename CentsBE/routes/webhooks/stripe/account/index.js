const router = require('express').Router();

const mapWebhookEvent = require('./mapWebhookEvent');

// middleware
const constructWebhookMiddleware = require('../../../../middlewares/stripe/constructWebhookEvent');

router.post('/', constructWebhookMiddleware, mapWebhookEvent);

module.exports = exports = router;
