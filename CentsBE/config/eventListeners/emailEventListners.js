const eventEmitter = require('../eventEmitter');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const { emailNotificationQueue } = require('../../appQueues');

eventEmitter.on('emailNotification', async (eventName, payload) => {
    try {
        emailNotificationQueue.add('emailNotification', {
            ...payload,
            eventName,
        });
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'error occurred in email notification listener.',
        });
    }
});
