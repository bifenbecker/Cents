const Queue = require('bull');
const { envVariables } = require('../constants/constants');

const { queueOptions, queueOptions1, queueOptions2, queueOptions3 } = require('./config');
const sendDailyDigestEmail = require('./dailyDigestEmail');

const LoggerHandler = require('../LoggerHandler/LoggerHandler');

const {
    store,
    centsCustomerAddress,
    onlineOrderSubmitNotification,
    doorDashDeliveryNotification,
    orderSmsNotification,
    emailNotification,
    doorDashOrderSubmittedNotification,
    completeActiveDeliveries,
    cancelDoordashDelivery,
    cancelDelayedDeliveries,
    downloadReport,
} = require('./eventHandlers');
const rescheduleOrderDeliveries = require('./rescheduleOrderDeliveries');
const stripeCustomerCreate = require('./stripeCustomer');
const updateMachineTurnsStats = require('./updateMachineTurnsStats');
const uploadCustomerList = require('./uploadCustomerList');
const checkTurnStatus = require('./checkTurnStatus');
const createOnlineOrderForRecurringSubscription = require('./createOnlineOrderForRecurringSubscription');
const cancelUnpaidInventoryOrders = require('./cancelUnpaidInventoryOrders');

const queueNames = {
    dialyDigestEmail: `dialyDigestEmail_${process.env.ENV_NAME}`,
    storeQueue: `storeQueue_${process.env.ENV_NAME}`,
    stripeCustomerQueue: `stripeCustomerQueue_${process.env.ENV_NAME}`,
    centsCustomerAddressQueue: `centsCustomerAddressQueue_${process.env.ENV_NAME}`,
    rescheduleOrderDeliveriesQueue: `rescheduleOrderDeliveriesQueue_${process.env.ENV_NAME}`,
    onlineOrderSubmitQueue: `onlineOrderSubmitQueue_${process.env.ENV_NAME}`,
    updateMachineTurnsStatsQueue: `updateMachineTurnsStats_${process.env.ENV_NAME}`,
    doorDashDeliveryUpdateQueue: `doorDashDeliveryUpdateQueue_${process.env.ENV_NAME}`,
    orderSmsNotificationQueue: `orderSmsNotificationQueue_${process.env.ENV_NAME}`,
    emailNotificationQueue: `emailNotificationQueue_${process.env.ENV_NAME}`,
    doorDashOrderSubmittedQueue: `doorDashOrderSubmittedQueue_${process.env.ENV_NAME}`,
    uploadCustomerListQueue: `uploadCustomerListQueue_${process.env.ENV_NAME}`,
    checkTurnStatusQueue: `checkTurnStatusQueue_${process.env.ENV_NAME}`,
    serviceOrderCompletedQueue: `serviceOrderCompletedQueue_${process.env.ENV_NAME}`,
    cancelDoordashDeliveryQueue: `cancelDoordashDeliveryQueue_${process.env.ENV_NAME}`,
    cancelDelayedDeliveriesQueue: `cancelDelayedDeliveriesQueue_${process.env.ENV_NAME}`,
    createOnlineOrderForRecurringSubscriptionQueue: `createOnlineOrderForRecurringSubscription_${process.env.ENV_NAME}`,
    downloadReportQueue: `downloadReportQueue_${process.env.ENV_NAME}`,
    cancelUnpaidInventoryOrders: `cancelUnpaidInventoryOrders_${process.env.ENV_NAME}`,
};

const queues = {};
Object.values(queueNames).forEach((queueName, index) => {
    // eslint-disable-next-line no-nested-ternary
    const options =
        index < 3
            ? queueOptions
            : index < 6
            ? queueOptions1
            : index < 8
            ? queueOptions2
            : queueOptions3;
    const newQueue = new Queue(queueName, options);

    queues[`${queueName}`] = newQueue;
    newQueue.on('error', (error) => {
        LoggerHandler('error', error);
    });
});

if (process.env.NODE_ENV !== 'test' && process.env.QUEUE_RUNNER === 'TRUE') {
    LoggerHandler('info', 'Queue runner:::::::::::::::');
    queues[queueNames.rescheduleOrderDeliveriesQueue].process(2, rescheduleOrderDeliveries);
    queues[queueNames.rescheduleOrderDeliveriesQueue].add(
        {},
        {
            repeat: {
                cron: '0 11 * * *',
            },
        },
    );
    queues[queueNames.cancelUnpaidInventoryOrders].process(2, cancelUnpaidInventoryOrders);
    queues[queueNames.cancelUnpaidInventoryOrders].add(
        {},
        {
            repeat: {
                cron: '0 */2 * * *',
            },
        },
    );
    queues[queueNames.updateMachineTurnsStatsQueue].process(updateMachineTurnsStats);
    queues[queueNames.updateMachineTurnsStatsQueue].add(
        {},
        {
            repeat: {
                cron: '*/30 * * * *',
            },
        },
    );
    queues[queueNames.createOnlineOrderForRecurringSubscriptionQueue].process(
        createOnlineOrderForRecurringSubscription,
    );
    queues[queueNames.createOnlineOrderForRecurringSubscriptionQueue].add(
        {},
        {
            repeat: {
                cron: '*/30 * * * *',
            },
        },
    );
    if (process.env.ENABLE_EMAIL_DIGEST === 'TRUE') {
        queues[queueNames.dialyDigestEmail].process(2, sendDailyDigestEmail);
        queues[queueNames.dialyDigestEmail].add(
            {},
            {
                repeat: {
                    cron: envVariables.CRON_EXPRESSION,
                },
            },
        );
    } else {
        queues[queueNames.dialyDigestEmail].getRepeatableJobs().then((repetableJobs) => {
            repetableJobs.forEach((job) => {
                LoggerHandler('info', `Removed job:::::::: ${job.key}`);
                queues[queueNames.dialyDigestEmail].removeRepeatableByKey(job.key);
            });
        });
    }
    queues[queueNames.storeQueue].process('index_store', 2, store.indexStore);
    queues[queueNames.storeQueue].process('store_updated', 2, store.storeAddressChangeHandler);
    queues[queueNames.stripeCustomerQueue].process('stripeCustomerCreate', 2, stripeCustomerCreate);
    queues[queueNames.centsCustomerAddressQueue].process(
        'customer_address_created',
        2,
        centsCustomerAddress.updateLatitudeAndLongitude,
    );
    queues[queueNames.onlineOrderSubmitQueue].process(
        'onlineOrderSubmitQueue',
        2,
        onlineOrderSubmitNotification,
    );
    queues[queueNames.orderSmsNotificationQueue].process(
        'orderSmsNotification',
        2,
        orderSmsNotification,
    );

    LoggerHandler('info', 'Removing completed SMS notification jobs over 5 days old');
    queues[queueNames.orderSmsNotificationQueue].clean(432000000);

    queues[queueNames.emailNotificationQueue].process('emailNotification', 2, emailNotification);
    queues[queueNames.doorDashDeliveryUpdateQueue].process(
        'doorDashDeliveryUpdateQueue',
        2,
        doorDashDeliveryNotification,
    );
    queues[queueNames.uploadCustomerListQueue].process(
        'uploadCustomerListQueue',
        2,
        uploadCustomerList,
    );
    queues[queueNames.checkTurnStatusQueue].process('checkTurnStatusQueue', 2, checkTurnStatus);
    queues[queueNames.serviceOrderCompletedQueue].process(
        'serviceOrderCompletedQueue',
        2,
        completeActiveDeliveries,
    );
    queues[queueNames.cancelDoordashDeliveryQueue].process(
        'cancelDoordashDeliveryQueue',
        2,
        cancelDoordashDelivery,
    );
    queues[queueNames.cancelDelayedDeliveriesQueue].process(
        'cancelDelayedDeliveriesQueue',
        2,
        cancelDelayedDeliveries,
    );
    queues[queueNames.downloadReportQueue].process('downloadReportQueue', 2, downloadReport);
}

if (process.env.ENV_NAME === 'production') {
    queues[queueNames.doorDashOrderSubmittedQueue].process(
        'doorDashOrderSubmittedQueue',
        2,
        doorDashOrderSubmittedNotification,
    );
}

// Need to run todo

module.exports = {
    queues,
    queueNames,
    storeQueue: queues[queueNames.storeQueue],
    stripeCustomerQueue: queues[queueNames.stripeCustomerQueue],
    centsCustomerAddressQueue: queues[queueNames.centsCustomerAddressQueue],
    onlineOrderSubmitQueue: queues[queueNames.onlineOrderSubmitQueue],
    doorDashDeliveryUpdateQueue: queues[queueNames.doorDashDeliveryUpdateQueue],
    orderSmsNotificationQueue: queues[queueNames.orderSmsNotificationQueue],
    emailNotificationQueue: queues[queueNames.emailNotificationQueue],
    doorDashOrderSubmittedQueue: queues[queueNames.doorDashOrderSubmittedQueue],
    uploadCustomerListQueue: queues[queueNames.uploadCustomerListQueue],
    checkTurnStatusQueue: queues[queueNames.checkTurnStatusQueue],
    serviceOrderCompletedQueue: queues[queueNames.serviceOrderCompletedQueue],
    cancelDoordashDeliveryQueue: queues[queueNames.cancelDoordashDeliveryQueue],
    cancelDelayedDeliveriesQueue: queues[queueNames.cancelDelayedDeliveriesQueue],
    downloadReportQueue: queues[queueNames.downloadReportQueue],
};
