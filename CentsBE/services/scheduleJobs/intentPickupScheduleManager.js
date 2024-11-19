const ScheduleJobManager = require('./scheduleJobManager');
const ScheduledJob = require('../../models/scheduledJobs');
const {
    emailNotificationEvents,
    orderSmsEvents,
    scheduledJobStatuses,
} = require('../../constants/constants');
const { orderSmsNotificationQueue, emailNotificationQueue } = require('../../appQueues');
const { toDateWithTimezone } = require('../../helpers/dateFormatHelper');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

class IntentPickupScheduleManager extends ScheduleJobManager {
    constructor(intentPickup, storeTimezone, serviceOrderId, notificationType) {
        if (notificationType === 'sms') {
            super('orderSmsNotification', orderSmsNotificationQueue);
        } else {
            super('emailNotification', emailNotificationQueue);
        }

        this.intentPickup = intentPickup;
        this.storeTimezone = storeTimezone;
        this.serviceOrderId = serviceOrderId;
        this.notificationType = notificationType;
    }

    getScheduledJob() {
        return ScheduledJob.query().findOne({
            scheduledJobForId: this.intentPickup.id,
            scheduledJobForType: 'OrderPickup',
            status: scheduledJobStatuses.SCHEDULED,
            queueName: this.queueName,
        });
    }

    createScheduledJob() {
        if (this.job) {
            return ScheduledJob.query().insert({
                jobId: this.job.id,
                queueName: this.queueName,
                status: 'SCHEDULED',
                scheduledAt: new Date(),
                scheduledJobForId: this.intentPickup.id,
                scheduledJobForType: 'OrderPickup',
                jobType: this.notificationType,
            });
        }
        return null;
    }

    async addJobToQueue(timeToTriggerTheJob) {
        if (this.notificationType === 'sms') {
            this.job = await orderSmsNotificationQueue.add(
                this.queueName,
                {
                    serviceOrderId: this.serviceOrderId,
                    eventName: orderSmsEvents.INTENT_ORDER_PICKUP_NOTIFICATION,
                },
                {
                    delay: timeToTriggerTheJob,
                },
            );
        } else {
            // notificationType is email
            this.job = await emailNotificationQueue.add(
                this.queueName,
                {
                    serviceOrderId: this.serviceOrderId,
                    eventName: emailNotificationEvents.INTENT_ORDER_PICKUP_NOTIFICATION,
                },
                {
                    delay: timeToTriggerTheJob,
                },
            );
        }
    }

    /**
     * schedules job at 5 minutes prior to the end of the scheduled pickup window
     */
    async scheduleJob() {
        try {
            this.scheduledJob = await this.getScheduledJob();
            if (this.scheduledJob) {
                this.jobId = this.scheduledJob.jobId;
                // cancel the existing job and create a new job when
                // intent_created order pickup is rescheduled
                await this.cancelScheduledJob();
            }

            const pickupTime = toDateWithTimezone(
                Number(this.intentPickup.deliveryWindow[1]),
                this.storeTimezone,
            );
            const currentTime = toDateWithTimezone(new Date(), this.storeTimezone);

            const timeToTriggerTheJob =
                pickupTime.subtract(5, 'minutes').valueOf() - currentTime.valueOf();
            await this.addJobToQueue(timeToTriggerTheJob);

            await this.createScheduledJob();
        } catch (error) {
            LoggerHandler('error', error);
            throw error;
        }
    }
}

module.exports = exports = IntentPickupScheduleManager;
