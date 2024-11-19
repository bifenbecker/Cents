const router = require('express').Router();

const sendScheduledTextValidation = require('../../../validations/employeeTab/notifications/sendScheduledText');
const { sendScheduledTextMessage } = require('./notificationController');

router.post('/scheduled', sendScheduledTextValidation, sendScheduledTextMessage);

module.exports = exports = router;
