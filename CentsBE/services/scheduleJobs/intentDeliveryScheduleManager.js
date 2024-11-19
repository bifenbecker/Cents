const ScheduleJobManager = require('./scheduleJobManager');
const ScheduledJob = require('../../models/scheduledJobs');
const { orderSmsEvents, scheduledJobStatuses } = require('../../constants/constants');
const { orderSmsNotificationQueue } = require('../../appQueues');
const { toDateWithTimezone } = require('../../helpers/dateFormatHelper');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

class IntentDeliveryScheduleManager extends ScheduleJobManager {
    constructor(intentDelivery, storeTimezone, serviceOrderId) {
        super('orderSmsNotification', orderSmsNotificationQueue);
        this.intentDelivery = intentDelivery;
        this.storeTimezone = storeTimezone;
        this.serviceOrderId = serviceOrderId;
    }

    getScheduledJob() {
        return ScheduledJob.query().findOne({
            scheduledJobForId: this.intentDelivery.id,
            scheduledJobForType: 'OrderDelivery',
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
                scheduledJobForId: this.intentDelivery.id,
                scheduledJobForType: 'OrderDelivery',
                jobType: 'sms',
            });
        }
        return null;
    }

    async addJobToQueue(timeToTriggerTheJob) {
        this.job = await orderSmsNotificationQueue.add(
            this.queueName,
            {
                serviceOrderId: this.serviceOrderId,
                eventName: orderSmsEvents.INTENT_ORDER_DELIVERY_NOTIFICATION,
            },
            {
                delay: timeToTriggerTheJob,
            },
        );
    }

    /**
     * schedules a job to send sms to the customer at 7pm the previous day before the delivery
     */
    async scheduleJob() {
        try {
            this.scheduledJob = await this.getScheduledJob();
            if (this.scheduledJob) {
                this.jobId = this.scheduledJob.jobId;
                // cancel the existing job and create a new job when
                // intent_created order delivery is rescheduled
                await this.cancelScheduledJob();
            }

            const deliveryTime = toDateWithTimezone(
                Number(this.intentDelivery.deliveryWindow[0]),
                this.storeTimezone,
            );
            const deliveryStartHour = deliveryTime.hour();

            const currentTime = toDateWithTimezone(new Date(), this.storeTimezone);
            let timeToTriggerTheJob;
            if (currentTime.format('DD/MM/YYYY') === deliveryTime.format('DD/MM/YYYY')) {
                // if delivery start time is less than 7 pm then we should not trigger the job
                if (deliveryStartHour > 19) {
                    const jobStartTime = toDateWithTimezone(new Date(), this.storeTimezone);

                    timeToTriggerTheJob =
                        jobStartTime.startOf('day').add(19, 'hour').valueOf() -
                        currentTime.valueOf();
                    await this.addJobToQueue(timeToTriggerTheJob);
                }
            } else {
                const scheduledTime = deliveryTime.subtract(1, 'day').set('hour', 19).valueOf();
                timeToTriggerTheJob = scheduledTime - currentTime.valueOf();

                await this.addJobToQueue(timeToTriggerTheJob);
            }
            await this.createScheduledJob();
        } catch (error) {
            LoggerHandler('error', error);
            throw error;
        }
    }
}

module.exports = exports = IntentDeliveryScheduleManager;
