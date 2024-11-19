const ScheduleJobManager = require('./scheduleJobManager');
const ScheduledJob = require('../../models/scheduledJobs');
const { scheduledJobStatuses } = require('../../constants/constants');
const { cancelDelayedDeliveriesQueue } = require('../../appQueues');
const { toDateWithTimezone } = require('../../helpers/dateFormatHelper');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

class ReturnDeliveryScheduleManager extends ScheduleJobManager {
    constructor(intentDelivery, storeTimezone, serviceOrderId) {
        super('cancelDelayedDeliveriesQueue', cancelDelayedDeliveriesQueue);
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
        this.job = await cancelDelayedDeliveriesQueue.add(
            this.queueName,
            {
                serviceOrderId: this.serviceOrderId,
            },
            {
                delay: timeToTriggerTheJob,
            },
        );
    }

    /**
     * schedules a job at the end of the delivery window to cancel the delivery if processing is not completed yet
     */
    async scheduleJob() {
        try {
            this.scheduledJob = await this.getScheduledJob();
            if (this.scheduledJob) {
                // cancel the existing job and create a new job when
                // intent_created order delivery is rescheduled
                this.jobId = this.scheduledJob.jobId;
                await this.cancelScheduledJob();
            }

            const deliveryTime = toDateWithTimezone(
                Number(this.intentDelivery.deliveryWindow[1]),
                this.storeTimezone,
            );

            const currentTime = toDateWithTimezone(new Date(), this.storeTimezone);
            const timeToTriggerTheJob = deliveryTime.valueOf() - currentTime.valueOf();

            await this.addJobToQueue(timeToTriggerTheJob);
            await this.createScheduledJob();
        } catch (error) {
            LoggerHandler('error', error);
            throw error;
        }
    }
}

module.exports = exports = ReturnDeliveryScheduleManager;
