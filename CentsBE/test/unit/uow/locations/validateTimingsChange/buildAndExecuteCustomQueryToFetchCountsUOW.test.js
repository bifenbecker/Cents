require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');

const buildAndExecuteCustomQueryToFetchCountsUOW = require('../../../../../uow/locations/validateTimingsChange/buildAndExecuteCustomQueryToFetchCountsUOW');
const { SHIFT_TYPES } = require('../../../../../lib/constants');
const storeSettings = require('../../../../../models/storeSettings');

describe('test buildAndExecuteCustomQueryToFetchCountsUOW', async () => {
    let shift, timing, serviceOrder, order, orderDelivery;

    describe('test OWN DRIVER windows', async () => {
        beforeEach(async () => {
            serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                status: 'SUBMITTED',
                orderType: 'ONLINE',
            });
            order = await factory.create('serviceOrderMasterOrder', {
                orderableId: serviceOrder.id,
            });
            shift = await factory.create('shift', {
                type: SHIFT_TYPES.OWN_DELIVERY,
                storeId: serviceOrder.storeId,
            });
            timing = await factory.create('timing', {
                shiftId: shift.id,
                startTime: '1970-01-01T11:00:00.000Z',
                endTime: '1970-01-01T12:00:00.000Z',
            });
            orderDelivery = await factory.create('orderDelivery', {
                orderId: order.id,
                storeId: serviceOrder.storeId,
                deliveryProvider: 'OWN_DELIVERY',
                timingsId: timing.id,
            });
            await storeSettings
                .query()
                .findOne({ storeId: serviceOrder.storeId })
                .patch({ timeZone: 'UTC' });
        });

        it('should return counts for OWN_DELIVERY timings', async () => {
            const newTiming = await factory.create('timing', {
                shiftId: shift.id,
                startTime: '1970-01-01T12:00:00.000Z',
            });
            await factory.create('recurringSubscription', {
                pickupTimingsId: timing.id,
                returnTimingsId: null,
                pickupWindow: orderDelivery.window,
                returnWindow: [],
            });
            response = await buildAndExecuteCustomQueryToFetchCountsUOW({
                storeId: shift.storeId,
                type: SHIFT_TYPES.OWN_DELIVERY,
                updatedTimingIds: [timing.id, newTiming.id],
                timing: {
                    isActive: false,
                    startTime: timing.startTime,
                    endTime: timing.endTime,
                },
            });

            const counts = response.timingsWithDeliveriesAndSubscriptionsCount;
            const timingWithNoOrderDeliveries = counts.find((t) => t.id === newTiming.id);
            const timingWithOrderDeliveries = counts.find((t) => t.id === timing.id);

            expect(timingWithNoOrderDeliveries.activeOrderDeliveriesCount).to.eq('0');
            expect(timingWithNoOrderDeliveries.activeRecurringSubscriptionCount).to.eq('0');
            expect(timingWithOrderDeliveries.activeOrderDeliveriesCount).to.eq('1');
            expect(timingWithOrderDeliveries.activeRecurringSubscriptionCount).to.eq('1');
        });
    });

    describe('test ON_DEMAND windows', async () => {
        beforeEach(async () => {
            serviceOrder = await factory.create('serviceOrderWithReturnMethod', {
                status: 'SUBMITTED',
                orderType: 'ONLINE',
            });
            order = await factory.create('serviceOrderMasterOrder', {
                orderableId: serviceOrder.id,
            });
            shift = await factory.create('shift', {
                type: SHIFT_TYPES.CENTS_DELIVERY,
                storeId: serviceOrder.storeId,
            });
            timing = await factory.create('timing', {
                shiftId: shift.id,
                startTime: '1970-01-01T11:00:00.000Z',
                endTime: '1970-01-01T12:00:00.000Z',
            });
            orderDelivery = await factory.create('orderDelivery', {
                orderId: order.id,
                storeId: serviceOrder.storeId,
                deliveryProvider: 'DOORDASH',
                timingsId: timing.id,
                deliveryWindow: [
                    new Date('1970-01-01T11:00:00.000Z').getTime(),
                    new Date('1970-01-01T11:30:00.000Z').getTime(),
                ],
            });
            await storeSettings
                .query()
                .findOne({ storeId: serviceOrder.storeId })
                .patch({ timeZone: 'UTC' });
        });

        it('should return counts for timings that are being inactivated', async () => {
            const newTiming = await factory.create('timing', {
                shiftId: shift.id,
                startTime: '1970-01-01T12:00:00.000Z',
            });
            await factory.create('recurringSubscription', {
                pickupTimingsId: newTiming.id,
                returnTimingsId: null,
                pickupWindow: orderDelivery.window,
                returnWindow: [],
            });
            response = await buildAndExecuteCustomQueryToFetchCountsUOW({
                storeId: shift.storeId,
                type: SHIFT_TYPES.CENTS_DELIVERY,
                updatedTimingIds: [timing.id, newTiming.id],
                timing: {
                    isActive: false,
                    startTime: timing.startTime,
                    endTime: timing.endTime,
                },
            });

            const counts = response.timingsWithDeliveriesAndSubscriptionsCount;
            const newTimingCounts = counts.find((t) => t.id === newTiming.id);
            const timingCounts = counts.find((t) => t.id === timing.id);

            expect(newTimingCounts.activeOrderDeliveriesCount).to.eq('0');
            expect(newTimingCounts.activeRecurringSubscriptionCount).to.eq('1');
            expect(timingCounts.activeOrderDeliveriesCount).to.eq('1');
            expect(timingCounts.activeRecurringSubscriptionCount).to.eq('0');
        });

        it('should return counts as 0 for timings whose associated deliveries fall under the new timings', async () => {
            await factory.create('recurringSubscription', {
                pickupTimingsId: timing.id,
                returnTimingsId: null,
                pickupWindow: orderDelivery.deliveryWindow,
                returnWindow: [],
            });
            response = await buildAndExecuteCustomQueryToFetchCountsUOW({
                storeId: shift.storeId,
                type: SHIFT_TYPES.CENTS_DELIVERY,
                updatedTimingIds: [timing.id],
                timing: {
                    isActive: true,
                    startTime: '1970-01-01T11:00:00.000Z',
                    endTime: '1970-01-01T13:00:00.000Z',
                },
            });

            const counts = response.timingsWithDeliveriesAndSubscriptionsCount;
            const timingCounts = counts.find((t) => t.id === timing.id);

            expect(timingCounts.activeOrderDeliveriesCount).to.eq('0');
            expect(timingCounts.activeRecurringSubscriptionCount).to.eq('0');
        });

        it('should return counts for timings whose associated deliveries does not fall under the new timings', async () => {
            await factory.create('recurringSubscription', {
                pickupTimingsId: timing.id,
                returnTimingsId: null,
                pickupWindow: orderDelivery.deliveryWindow,
                returnWindow: [],
            });
            response = await buildAndExecuteCustomQueryToFetchCountsUOW({
                storeId: shift.storeId,
                type: SHIFT_TYPES.CENTS_DELIVERY,
                updatedTimingIds: [timing.id],
                timing: {
                    isActive: true,
                    startTime: '1970-01-01T16:00:00.000Z',
                    endTime: '1970-01-01T17:00:00.000Z',
                },
            });

            const counts = response.timingsWithDeliveriesAndSubscriptionsCount;
            const timingCounts = counts.find((t) => t.id === timing.id);

            expect(timingCounts.activeOrderDeliveriesCount).to.eq('1');
            expect(timingCounts.activeRecurringSubscriptionCount).to.eq('1');
        });
    });
});
