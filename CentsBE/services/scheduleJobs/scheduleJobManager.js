const { scheduledJobStatuses } = require('../../constants/constants');
const ScheduledJob = require('../../models/scheduledJobs');

class ScheduleJobManager {
    constructor(queueName, queue, jobId) {
        this.queueName = queueName;
        this.queue = queue;
        this.jobId = jobId;
    }

    scheduleJob() {
        // schedule the job
    }

    async removeScheduledJob() {
        const job = await this.queue.getJob(this.jobId);
        return job.remove();
    }

    async cancelScheduledJob() {
        await this.removeScheduledJob();
        return ScheduledJob.query()
            .patch({
                status: scheduledJobStatuses.CANCELED,
            })
            .findOne({
                jobId: this.jobId,
            });
    }

    completeScheduledJob() {
        return ScheduledJob.query()
            .patch({
                status: scheduledJobStatuses.COMPLETED,
            })
            .findOne({
                jobId: this.jobId,
            });
    }
}

module.exports = exports = ScheduleJobManager;
