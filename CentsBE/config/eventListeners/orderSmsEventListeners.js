const eventEmitter = require('../eventEmitter');
const { orderSmsNotificationQueue } = require('../../appQueues');
const IntentDeliveryScheduleManager = require('../../services/scheduleJobs/intentDeliveryScheduleManager');
const IntentPickupScheduleManager = require('../../services/scheduleJobs/intentPickupScheduleManager');
const ReturnDeliveryScheduleManager = require('../../services/scheduleJobs/returnDeliveryScheduleManager');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

eventEmitter.on(
    'orderSmsNotification',
    (eventName, serviceOrderId, routeInfo = {}, smsScheduleInfo = {}) => {
        try {
            const { eta, stopNumber } = routeInfo || {};
            const { dateScheduled } = smsScheduleInfo || {};
            // eta will be sent only when starting the route for driver app
            orderSmsNotificationQueue.add('orderSmsNotification', {
                serviceOrderId,
                eventName,
                routeInfo: {
                    eta,
                    stopNumber,
                },
                smsScheduleInfo: { dateScheduled },
            });
        } catch (error) {
            LoggerHandler('error', `error occurred in order created sms listener:\n\n${error}`, {
                eventName,
                serviceOrderId,
            });
        }
    },
);

eventEmitter.on(
    'intentCreatedOrderDelivery',
    async ({ serviceOrderId, intentCreatedDelivery, storeTimezone }) => {
        try {
            const intentDeliveryScheduleManager = new IntentDeliveryScheduleManager(
                intentCreatedDelivery,
                storeTimezone,
                serviceOrderId,
            );
            await intentDeliveryScheduleManager.scheduleJob();
            const returnDeliveryScheduleManager = new ReturnDeliveryScheduleManager(
                intentCreatedDelivery,
                storeTimezone,
                serviceOrderId,
            );
            await returnDeliveryScheduleManager.scheduleJob();
        } catch (error) {
            LoggerHandler(
                'error',
                `error occurred in intent created order delivery event listener:\n\n${error}`,
                {
                    serviceOrderId,
                    intentCreatedDelivery,
                    storeTimezone,
                },
            );
        }
    },
);

eventEmitter.on(
    'intentCreatedOrderPickup',
    async ({ serviceOrderId, intentCreatedPickup, storeTimezone }) => {
        try {
            const intentPickupScheduleManagerSms = new IntentPickupScheduleManager(
                intentCreatedPickup,
                storeTimezone,
                serviceOrderId,
                'sms',
            );
            await intentPickupScheduleManagerSms.scheduleJob();

            const intentPickupScheduleManagerEmail = new IntentPickupScheduleManager(
                intentCreatedPickup,
                storeTimezone,
                serviceOrderId,
                'email',
            );
            await intentPickupScheduleManagerEmail.scheduleJob();
        } catch (error) {
            LoggerHandler(
                'error',
                `error occurred in intent created order pickup event listener:\n\n${error}`,
                {
                    serviceOrderId,
                    intentCreatedPickup,
                    storeTimezone,
                },
            );
        }
    },
);
