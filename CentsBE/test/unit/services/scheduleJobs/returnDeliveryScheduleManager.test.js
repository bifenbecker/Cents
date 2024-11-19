require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { cancelDelayedDeliveriesQueue } = require('../../../../appQueues');
const ReturnDeliveryScheduleManager = require('../../../../services/scheduleJobs/returnDeliveryScheduleManager');
const { toDateWithTimezone } = require('../../../../helpers/dateFormatHelper');
const ScheduledJob = require('../../../../models/scheduledJobs');

describe('test ReturnDeliveryScheduleManager', () => {
    let currentTime, deliveryWindow, returnDeliveryScheduleManager, storeTimezone;
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

        const intentCreatedDelivery = await factory.create('orderDelivery', {
            status: 'SCHEDULED',
            orderId: order.id,
            storeId: serviceOrder.storeId,
            deliveryProvider: 'DOORDASH',
            type: 'RETURN',
            deliveryWindow,
        });

        returnDeliveryScheduleManager = new ReturnDeliveryScheduleManager(
            intentCreatedDelivery,
            storeTimezone,
            serviceOrder.id,
        );
    });

    describe('scheduleJob()', () => {
        it('should schedule at the end of delivery window', async () => {
            // act
            await returnDeliveryScheduleManager.scheduleJob();

            // assert
            const job = await cancelDelayedDeliveriesQueue.getJob(
                returnDeliveryScheduleManager.job.id,
            );
            const expectedDelay =
                toDateWithTimezone(Number(deliveryWindow[1]), storeTimezone).valueOf() -
                currentTime.valueOf();

            expect(Math.abs(expectedDelay - job.delay)).to.be.lessThan(1000);

            const scheduledJob = await ScheduledJob.query().findOne({
                jobId: returnDeliveryScheduleManager.job.id,
            });

            expect(scheduledJob).to.have.property(
                'jobId',
                Number(returnDeliveryScheduleManager.job.id),
            );
            expect(scheduledJob).to.have.property('jobType', 'sms');
            expect(scheduledJob).to.have.property('queueName', 'cancelDelayedDeliveriesQueue');
            expect(scheduledJob).to.have.property('scheduledJobForType', 'OrderDelivery');
            expect(scheduledJob).to.have.property('status', 'SCHEDULED');
        });
    });

    describe('getScheduledJob()', () => {
        it('should schedule 30 minutes before end of delivery window', async () => {
            // act
            await returnDeliveryScheduleManager.scheduleJob();
            const scheduledJob = await returnDeliveryScheduleManager.getScheduledJob();

            // assert
            expect(scheduledJob).to.have.property(
                'jobId',
                Number(returnDeliveryScheduleManager.job.id),
            );
            expect(scheduledJob).to.have.property('jobType', 'sms');
            expect(scheduledJob).to.have.property('queueName', 'cancelDelayedDeliveriesQueue');
            expect(scheduledJob).to.have.property('scheduledJobForType', 'OrderDelivery');
            expect(scheduledJob).to.have.property('status', 'SCHEDULED');
        });
    });
});
