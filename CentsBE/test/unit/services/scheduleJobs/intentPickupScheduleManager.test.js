require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { orderSmsNotificationQueue, emailNotificationQueue } = require('../../../../appQueues');
const IntentPickupScheduleManager = require('../../../../services/scheduleJobs/intentPickupScheduleManager');
const { toDateWithTimezone } = require('../../../../helpers/dateFormatHelper');
const ScheduledJob = require('../../../../models/scheduledJobs');

describe('test IntentPickupScheduleManager', () => {
    let currentTime,
        deliveryWindow,
        intentPickupScheduleManagerEmail,
        intentPickupScheduleManagerSms,
        storeTimezone;
    beforeEach(async () => {
        storeTimezone = 'America/Los_Angeles';

        const store = await factory.create('store');

        const serviceOrder = await factory.create('serviceOrder', {
            status: 'SUBMITTED',
            storeId: store.id,
        });

        const order = await factory.create('order', {
            orderableId: serviceOrder.id,
            orderableType: 'ServiceOrder',
        });

        currentTime = toDateWithTimezone(new Date(), storeTimezone);
        deliveryWindow = [
            currentTime.clone().add(1, 'hour').valueOf(),
            currentTime.clone().add(2, 'hours').valueOf(),
        ];

        const orderDeliveryPickup = await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: 'DOORDASH',
            type: 'PICKUP',
            deliveryWindow,
        });

        intentPickupScheduleManagerSms = new IntentPickupScheduleManager(
            orderDeliveryPickup,
            storeTimezone,
            serviceOrder.id,
            'sms',
        );

        intentPickupScheduleManagerEmail = new IntentPickupScheduleManager(
            orderDeliveryPickup,
            storeTimezone,
            serviceOrder.id,
            'email',
        );
    });

    describe('scheduleJob()', () => {
        it('should schedule 5 minutes before end of delivery window - sms', async () => {
            // act
            await intentPickupScheduleManagerSms.scheduleJob();

            // assert
            const job = await orderSmsNotificationQueue.getJob(
                intentPickupScheduleManagerSms.job.id,
            );
            const expectedDelay =
                toDateWithTimezone(Number(deliveryWindow[1]), storeTimezone)
                    .subtract(5, 'minutes')
                    .valueOf() - currentTime.valueOf();

            expect(Math.abs(expectedDelay - job.delay)).to.be.lessThan(1000);

            const scheduledJob = await ScheduledJob.query().findOne({
                jobId: intentPickupScheduleManagerSms.job.id,
            });

            expect(scheduledJob).to.have.property(
                'jobId',
                Number(intentPickupScheduleManagerSms.job.id),
            );
            expect(scheduledJob).to.have.property('jobType', 'sms');
            expect(scheduledJob).to.have.property('queueName', 'orderSmsNotification');
            expect(scheduledJob).to.have.property('scheduledJobForType', 'OrderPickup');
            expect(scheduledJob).to.have.property('status', 'SCHEDULED');
        });

        it('should schedule 5 minutes before end of delivery window - email', async () => {
            // act
            await intentPickupScheduleManagerEmail.scheduleJob();

            // assert
            const job = await emailNotificationQueue.getJob(
                intentPickupScheduleManagerEmail.job.id,
            );
            const expectedDelay =
                toDateWithTimezone(Number(deliveryWindow[1]), storeTimezone)
                    .subtract(5, 'minutes')
                    .valueOf() - currentTime.valueOf();

            expect(Math.abs(expectedDelay - job.delay)).to.be.lessThan(1000);

            const scheduledJob = await ScheduledJob.query().findOne({
                jobId: intentPickupScheduleManagerEmail.job.id,
            });

            expect(scheduledJob).to.have.property(
                'jobId',
                Number(intentPickupScheduleManagerEmail.job.id),
            );
            expect(scheduledJob).to.have.property('jobType', 'email');
            expect(scheduledJob).to.have.property('queueName', 'emailNotification');
            expect(scheduledJob).to.have.property('scheduledJobForType', 'OrderPickup');
            expect(scheduledJob).to.have.property('status', 'SCHEDULED');
        });
    });

    describe('getScheduledJob()', () => {
        it('should schedule 5 minutes before end of delivery window - sms', async () => {
            // act
            await intentPickupScheduleManagerSms.scheduleJob();
            const scheduledJob = await intentPickupScheduleManagerSms.getScheduledJob();

            // assert
            expect(scheduledJob).to.have.property(
                'jobId',
                Number(intentPickupScheduleManagerSms.job.id),
            );
            expect(scheduledJob).to.have.property('jobType', 'sms');
            expect(scheduledJob).to.have.property('queueName', 'orderSmsNotification');
            expect(scheduledJob).to.have.property('scheduledJobForType', 'OrderPickup');
            expect(scheduledJob).to.have.property('status', 'SCHEDULED');
        });

        it('should schedule 5 minutes before end of delivery window - email', async () => {
            // act
            await intentPickupScheduleManagerEmail.scheduleJob();
            const scheduledJob = await intentPickupScheduleManagerEmail.getScheduledJob();

            // assert
            expect(scheduledJob).to.have.property(
                'jobId',
                Number(intentPickupScheduleManagerEmail.job.id),
            );
            expect(scheduledJob).to.have.property('jobType', 'email');
            expect(scheduledJob).to.have.property('queueName', 'emailNotification');
            expect(scheduledJob).to.have.property('scheduledJobForType', 'OrderPickup');
            expect(scheduledJob).to.have.property('status', 'SCHEDULED');
        });
    });
});
