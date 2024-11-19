const router = require('express').Router();

const mapWebhookEvent = require('./processTerminalWebhookEvent');

// middleware
const constructWebhookMiddleware = require('../../../../middlewares/stripe/constructTerminalWebhookEvent');

router.post('/', constructWebhookMiddleware, mapWebhookEvent);

module.exports = exports = router;
