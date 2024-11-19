require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');

const OrderDelivery = require('../../../../models/orderDelivery');
const RecurringSubscription = require('../../../../models/recurringSubscription');
const ServiceOrderRecurringSubscription = require('../../../../models/serviceOrderRecurringSubscription');

const { orderDeliveryStatuses } = require('../../../../constants/constants');
const { SHIFT_TYPES } = require('../../../../lib/constants');
const { toDateWithTimezone } = require('../../../../helpers/dateFormatHelper');

const RRuleService = require('../../../../services/rruleService');

describe('Test RRule Service', () => {
    let subscription,
        timeZone,
        interval,
        weekday,
        today,
        serviceOrderRecurringSubscription,
        serviceOrder,
        order,
        store,
        orderDelivery;

    beforeEach(async () => {
        store = await factory.create('store');
        timeZone = 'America/Los_Angeles';
        serviceOrder = await factory.create('serviceOrder', {
            orderType: 'ONLINE',
            status: 'READY_FOR_PROCESSING',
            storeId: store.id,
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        shift = await factory.create('shift', {
            storeId: store.id,
            type: SHIFT_TYPES.OWN_DELIVERY,
        });
        timing = await factory.create('timing', {
            shiftId: shift.id,
            startTime: '1970-01-01T10:00:00+00:00',
            endTime: '1970-01-01T11:00:00+00:00',
        });
        today = toDateWithTimezone(new Date(), timeZone).startOf('day');
        tomorrow = toDateWithTimezone(new Date(), timeZone).add(1, 'day').startOf('day');
        orderDelivery = await factory.create('orderDelivery', {
            orderId: order.id,
            type: 'PICKUP',
            status: 'SCHEDULED',
            timingsId: timing.id,
            deliveryWindow: [today.set({ hour: 10 }).valueOf(), today.set({ hour: 11 }).valueOf()],
        });
        subscription = await factory.create('recurringSubscription', {
            storeId: store.id,
            pickupTimingsId: timing.id,
            pickupWindow: [today.set({ hour: 10 }).valueOf(), today.set({ hour: 11 }).valueOf()],
        });
        serviceOrderRecurringSubscription = await factory.create(
            'serviceOrderRecurringSubscription',
            {
                recurringSubscriptionId: subscription.id,
                serviceOrderId: serviceOrder.id,
                pickupWindow: [
                    today.set({ hour: 10 }).valueOf(),
                    today.set({ hour: 11 }).valueOf(),
                ],
            },
        );
        // Rrule generation purposes
        interval = 1;
        weekday = 3;
    });

    describe('generateRule static function', () => {
        it('should create a rrule string', () => {
            const getRRuleString = RRuleService.generateRule(interval, weekday, new Date());
            expect(getRRuleString.split('\n')[1]).to.equal('RRULE:FREQ=WEEKLY;BYDAY=TH;INTERVAL=1');
        });

        it('should return error message', () => {
            try {
                interval = 0;
                weekday = -1;
                RRuleService.generateRule(interval, weekday, new Date());
            } catch (error) {
                return error;
            }
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('Either interval or weekday is invalid');
        });
    });

    describe('nextAvailablePickup prototype function(considering interval as 1)', () => {
        describe('when pickup is in progress', () => {
            it('should always return the current pickup window', async () => {
                const rRuleService = new RRuleService(subscription, timeZone);
                const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow();
                expect(nextAvailablePickup).to.be.an('array');
                expect(nextAvailablePickup).to.have.lengthOf(2);
                expect(nextAvailablePickup[0]).to.equal(orderDelivery.deliveryWindow[0]);
                expect(nextAvailablePickup[1]).to.equal(orderDelivery.deliveryWindow[1]);
            });
        });

        describe('when pickup is completed/canceled', () => {
            beforeEach(async () => {
                await OrderDelivery.query()
                    .patch({ status: orderDeliveryStatuses.COMPLETED })
                    .where({ id: orderDelivery.id });
            });

            it("should return the next week's pickup window", async () => {
                const rRuleService = new RRuleService(subscription, timeZone);
                const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow();
                expect(nextAvailablePickup).to.be.an('array');
                expect(nextAvailablePickup).to.have.lengthOf(2);
                const millisDiff = 7 * 24 * 60 * 60 * 1000;
                expect(nextAvailablePickup[0] - orderDelivery.deliveryWindow[0]).to.equal(
                    millisDiff,
                );
                expect(nextAvailablePickup[1] - orderDelivery.deliveryWindow[1]).to.equal(
                    millisDiff,
                );
            });

            describe('if next pickup is canceled', () => {
                beforeEach(async () => {
                    await RecurringSubscription.query()
                        .patch({
                            cancelledPickupWindows: [today.add(1, 'w').valueOf()],
                        })
                        .where({ id: subscription.id });
                });

                it('should show next canceled window when skipCanceled is false', async () => {
                    subscription = await RecurringSubscription.query().findById(subscription.id);
                    const rRuleService = new RRuleService(subscription, timeZone);
                    const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow();
                    expect(nextAvailablePickup).to.be.an('array');
                    expect(nextAvailablePickup).to.have.lengthOf(2);
                    const millisDiff = 7 * 24 * 60 * 60 * 1000;
                    expect(nextAvailablePickup[0] - orderDelivery.deliveryWindow[0]).to.equal(
                        millisDiff,
                    );
                    expect(nextAvailablePickup[1] - orderDelivery.deliveryWindow[1]).to.equal(
                        millisDiff,
                    );
                });

                it('should show next available window after canceled window when skipCanceled is true', async () => {
                    subscription = await RecurringSubscription.query().findById(subscription.id);
                    const rRuleService = new RRuleService(subscription, timeZone);
                    const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow(true);
                    expect(nextAvailablePickup).to.be.an('array');
                    expect(nextAvailablePickup).to.have.lengthOf(2);
                    const millisDiff = 2 * 7 * 24 * 60 * 60 * 1000;
                    expect(nextAvailablePickup[0] - orderDelivery.deliveryWindow[0]).to.equal(
                        millisDiff,
                    );
                    expect(nextAvailablePickup[1] - orderDelivery.deliveryWindow[1]).to.equal(
                        millisDiff,
                    );
                });
            });

            describe('if previous pickup did not get created(because of issues or the penultimate was one is still active)', () => {
                describe('if there are canceled orders', () => {
                    beforeEach(async () => {
                        // Pickup here is not created
                        tomorrowMinusOneWeek = toDateWithTimezone(new Date(), timeZone)
                            .add(1, 'day')
                            .startOf('day')
                            .subtract(1, 'w');
                        // pickup is canceled
                        tomorrowMinusTwoWeek = toDateWithTimezone(new Date(), timeZone)
                            .add(1, 'day')
                            .startOf('day')
                            .subtract(2, 'w');
                        // pickup is created and completed
                        tomorrowMinusThreeWeek = toDateWithTimezone(new Date(), timeZone)
                            .add(1, 'day')
                            .startOf('day')
                            .subtract(3, 'w');
                        const deliveryWindow = [
                            tomorrowMinusThreeWeek.set({ hour: 10 }).valueOf(),
                            tomorrowMinusThreeWeek.set({ hour: 11 }).valueOf(),
                        ];
                        await OrderDelivery.query()
                            .patch({ deliveryWindow })
                            .where({ id: orderDelivery.id });
                        await ServiceOrderRecurringSubscription.query()
                            .patch({ pickupWindow: deliveryWindow })
                            .where({ id: serviceOrderRecurringSubscription.id });
                        await RecurringSubscription.query()
                            .patch({
                                pickupWindow: deliveryWindow,
                                cancelledPickupWindows: [tomorrowMinusTwoWeek.valueOf()],
                            })
                            .where({ id: subscription.id });
                    });

                    it('should show next available pickup because the previous one got skipped', async () => {
                        subscription = await RecurringSubscription.query().findById(
                            subscription.id,
                        );
                        const rRuleService = new RRuleService(subscription, timeZone);
                        const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow();
                        expect(nextAvailablePickup).to.be.an('array');
                        expect(nextAvailablePickup).to.have.lengthOf(2);
                        expect(nextAvailablePickup[0]).to.equal(
                            tomorrow.set({ hour: 10 }).valueOf(),
                        );
                        expect(nextAvailablePickup[1]).to.equal(
                            tomorrow.set({ hour: 11 }).valueOf(),
                        );
                    });

                    it('should show next available pickup even if we are going to get the latest time after canceled pickups', async () => {
                        subscription = await RecurringSubscription.query().findById(
                            subscription.id,
                        );
                        const rRuleService = new RRuleService(subscription, timeZone);
                        const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow(
                            true,
                        );
                        expect(nextAvailablePickup).to.be.an('array');
                        expect(nextAvailablePickup).to.have.lengthOf(2);
                        expect(nextAvailablePickup[0]).to.equal(
                            tomorrow.set({ hour: 10 }).valueOf(),
                        );
                        expect(nextAvailablePickup[1]).to.equal(
                            tomorrow.set({ hour: 11 }).valueOf(),
                        );
                    });
                });

                describe('if there are no canceled orders', () => {
                    beforeEach(async () => {
                        // Pickup here is not created
                        tomorrowMinusOneWeek = toDateWithTimezone(new Date(), timeZone)
                            .add(1, 'day')
                            .startOf('day')
                            .subtract(1, 'w');
                        // pickup is created and completed
                        tomorrowMinusTwoWeek = toDateWithTimezone(new Date(), timeZone)
                            .add(1, 'day')
                            .startOf('day')
                            .subtract(2, 'w');
                        const deliveryWindow = [
                            tomorrowMinusTwoWeek.set({ hour: 10 }).valueOf(),
                            tomorrowMinusTwoWeek.set({ hour: 11 }).valueOf(),
                        ];
                        await OrderDelivery.query()
                            .patch({ deliveryWindow })
                            .where({ id: orderDelivery.id });
                        await ServiceOrderRecurringSubscription.query()
                            .patch({ pickupWindow: deliveryWindow })
                            .where({ id: serviceOrderRecurringSubscription.id });
                        await RecurringSubscription.query()
                            .patch({
                                pickupWindow: deliveryWindow,
                                cancelledPickupWindows: [],
                            })
                            .where({ id: subscription.id });
                    });

                    it('should show next available pickup because the previous one got skipped', async () => {
                        subscription = await RecurringSubscription.query().findById(
                            subscription.id,
                        );
                        const rRuleService = new RRuleService(subscription, timeZone);
                        const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow();
                        expect(nextAvailablePickup).to.be.an('array');
                        expect(nextAvailablePickup).to.have.lengthOf(2);
                        expect(nextAvailablePickup[0]).to.equal(
                            tomorrow.set({ hour: 10 }).valueOf(),
                        );
                        expect(nextAvailablePickup[1]).to.equal(
                            tomorrow.set({ hour: 11 }).valueOf(),
                        );
                    });

                    it('should show next available pickup even if we are going to get the latest time after canceled pickups', async () => {
                        subscription = await RecurringSubscription.query().findById(
                            subscription.id,
                        );
                        const rRuleService = new RRuleService(subscription, timeZone);
                        const nextAvailablePickup = await rRuleService.nextAvailablePickupWindow(
                            true,
                        );
                        expect(nextAvailablePickup).to.be.an('array');
                        expect(nextAvailablePickup).to.have.lengthOf(2);
                        expect(nextAvailablePickup[0]).to.equal(
                            tomorrow.set({ hour: 10 }).valueOf(),
                        );
                        expect(nextAvailablePickup[1]).to.equal(
                            tomorrow.set({ hour: 11 }).valueOf(),
                        );
                    });
                });

                describe('if last pickup is long time back with no canceled orders', () => {
                    describe('if last completed pickup is 4 weeks before tomorrow', () => {
                        beforeEach(async () => {
                            // Pickup here is not created
                            tomorrowMinusOneWeek = toDateWithTimezone(new Date(), timeZone)
                                .add(1, 'day')
                                .startOf('day')
                                .subtract(1, 'w');
                            // Pickup here is not created
                            tomorrowMinusTwoWeek = toDateWithTimezone(new Date(), timeZone)
                                .add(1, 'day')
                                .startOf('day')
                                .subtract(2, 'w');
                            // Pickup here is not created
                            tomorrowMinusThreeWeek = toDateWithTimezone(new Date(), timeZone)
                                .add(1, 'day')
                                .startOf('day')
                                .subtract(3, 'w');
                            // pickup is created and completed
                            tomorrowMinusFourWeek = toDateWithTimezone(new Date(), timeZone)
                                .add(1, 'day')
                                .startOf('day')
                                .subtract(4, 'w');
                            const deliveryWindow = [
                                tomorrowMinusFourWeek.set({ hour: 10 }).valueOf(),
                                tomorrowMinusFourWeek.set({ hour: 11 }).valueOf(),
                            ];
                            await OrderDelivery.query()
                                .patch({ deliveryWindow })
                                .where({ id: orderDelivery.id });
                            await ServiceOrderRecurringSubscription.query()
                                .patch({ pickupWindow: deliveryWindow })
                                .where({ id: serviceOrderRecurringSubscription.id });
                            await RecurringSubscription.query()
                                .patch({
                                    pickupWindow: deliveryWindow,
                                    cancelledPickupWindows: [],
                                })
                                .where({ id: subscription.id });
                        });

                        it('should show next available pickup because the previous one got skipped', async () => {
                            subscription = await RecurringSubscription.query().findById(
                                subscription.id,
                            );
                            const rRuleService = new RRuleService(subscription, timeZone);
                            const nextAvailablePickup =
                                await rRuleService.nextAvailablePickupWindow();
                            expect(nextAvailablePickup).to.be.an('array');
                            expect(nextAvailablePickup).to.have.lengthOf(2);
                            expect(nextAvailablePickup[0]).to.equal(
                                tomorrow.set({ hour: 10 }).valueOf(),
                            );
                            expect(nextAvailablePickup[1]).to.equal(
                                tomorrow.set({ hour: 11 }).valueOf(),
                            );
                        });

                        it('should show next available pickup even if we are going to get the latest time after canceled pickups', async () => {
                            subscription = await RecurringSubscription.query().findById(
                                subscription.id,
                            );
                            const rRuleService = new RRuleService(subscription, timeZone);
                            const nextAvailablePickup =
                                await rRuleService.nextAvailablePickupWindow(true);
                            expect(nextAvailablePickup).to.be.an('array');
                            expect(nextAvailablePickup).to.have.lengthOf(2);
                            expect(nextAvailablePickup[0]).to.equal(
                                tomorrow.set({ hour: 10 }).valueOf(),
                            );
                            expect(nextAvailablePickup[1]).to.equal(
                                tomorrow.set({ hour: 11 }).valueOf(),
                            );
                        });
                    });

                    describe('if last completed pickup is 4 weeks before today', () => {
                        beforeEach(async () => {
                            // Pickup here is not created
                            todayMinusOneWeek = toDateWithTimezone(new Date(), timeZone)
                                .startOf('day')
                                .subtract(1, 'w');
                            // Pickup here is not created
                            todayMinusTwoWeek = toDateWithTimezone(new Date(), timeZone)
                                .startOf('day')
                                .subtract(2, 'w');
                            // Pickup here is not created
                            todayMinusThreeWeek = toDateWithTimezone(new Date(), timeZone)
                                .startOf('day')
                                .subtract(3, 'w');
                            // pickup is created and completed
                            todayMinusFourWeek = toDateWithTimezone(new Date(), timeZone)
                                .startOf('day')
                                .subtract(4, 'w');
                            const deliveryWindow = [
                                todayMinusFourWeek.set({ hour: 10 }).valueOf(),
                                todayMinusFourWeek.set({ hour: 11 }).valueOf(),
                            ];
                            await OrderDelivery.query()
                                .patch({
                                    deliveryWindow,
                                })
                                .where({ id: orderDelivery.id });
                            await ServiceOrderRecurringSubscription.query()
                                .patch({ pickupWindow: deliveryWindow })
                                .where({ id: serviceOrderRecurringSubscription.id });
                            await RecurringSubscription.query()
                                .patch({
                                    pickupWindow: deliveryWindow,
                                    cancelledPickupWindows: [],
                                })
                                .where({ id: subscription.id });
                        });

                        it('should show next available pickup because the previous one got skipped', async () => {
                            subscription = await RecurringSubscription.query().findById(
                                subscription.id,
                            );
                            const rRuleService = new RRuleService(subscription, timeZone);
                            const nextAvailablePickup =
                                await rRuleService.nextAvailablePickupWindow();
                            expect(nextAvailablePickup).to.be.an('array');
                            expect(nextAvailablePickup).to.have.lengthOf(2);
                            expect(nextAvailablePickup[0]).to.equal(
                                toDateWithTimezone(new Date(), timeZone)
                                    .startOf('day')
                                    .add(1, 'w')
                                    .set({ hour: 10 })
                                    .valueOf(),
                            );
                            expect(nextAvailablePickup[1]).to.equal(
                                toDateWithTimezone(new Date(), timeZone)
                                    .startOf('day')
                                    .add(1, 'w')
                                    .set({ hour: 11 })
                                    .valueOf(),
                            );
                        });

                        it('should show next available pickup even if we are going to get the latest time after canceled pickups', async () => {
                            subscription = await RecurringSubscription.query().findById(
                                subscription.id,
                            );
                            const rRuleService = new RRuleService(subscription, timeZone);
                            const nextAvailablePickup =
                                await rRuleService.nextAvailablePickupWindow(true);
                            expect(nextAvailablePickup).to.be.an('array');
                            expect(nextAvailablePickup).to.have.lengthOf(2);
                            expect(nextAvailablePickup[0]).to.equal(
                                toDateWithTimezone(new Date(), timeZone)
                                    .startOf('day')
                                    .add(1, 'w')
                                    .set({ hour: 10 })
                                    .valueOf(),
                            );
                            expect(nextAvailablePickup[1]).to.equal(
                                toDateWithTimezone(new Date(), timeZone)
                                    .startOf('day')
                                    .add(1, 'w')
                                    .set({ hour: 11 })
                                    .valueOf(),
                            );
                        });
                    });
                });
            });
        });
    });

    describe('isNextPickupCancelled prototype function', () => {
        it('should return false if there are no canceled pickup windows', () => {
            const rRuleService = new RRuleService(subscription, timeZone);
            expect(rRuleService.isNextPickupCancelled()).to.be.false;
        });

        it('should return false if the canceled pickup window is in past', async () => {
            await RecurringSubscription.query()
                .patch({
                    cancelledPickupWindows: [today.subtract(1, 'w').valueOf()],
                })
                .where({ id: subscription.id });
            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);
            expect(rRuleService.isNextPickupCancelled()).to.be.false;
        });

        it('should return true if the canceled pickup window is today', async () => {
            await RecurringSubscription.query()
                .patch({
                    cancelledPickupWindows: [today.valueOf()],
                })
                .where({ id: subscription.id });
            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);
            expect(rRuleService.isNextPickupCancelled()).to.be.true;
        });

        it('should return true if the canceled pickup window is in future', async () => {
            await RecurringSubscription.query()
                .patch({
                    cancelledPickupWindows: [today.add(1, 'w').valueOf()],
                })
                .where({ id: subscription.id });
            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);
            expect(rRuleService.isNextPickupCancelled()).to.be.true;
        });
    });

    describe('reinstateNextPickup prototype function', () => {
        it('should throw error if next pickup is not canceled', async () => {
            const rRuleService = new RRuleService(subscription, timeZone);
            let errorMessage;

            try {
                await rRuleService.reinstateNextPickup();
            } catch (error) {
                errorMessage = error.message;
            }

            expect(errorMessage).to.equal("Sorry!! You can't reinitiate next pickup");
        });

        it('should return canceled windows without the last canceled pickup', async () => {
            await RecurringSubscription.query()
                .patch({
                    cancelledPickupWindows: [today.valueOf(), today.add(1, 'w').valueOf()],
                })
                .where({ id: subscription.id });
            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);
            const newCanceledWindows = await rRuleService.reinstateNextPickup();
            expect(newCanceledWindows).to.have.lengthOf(1);
            expect(newCanceledWindows).to.not.include(today.add(1, 'w').valueOf());
        });
    });

    describe('cancelNextPickup prototype function', () => {
        it('should throw error if next pickup is already canceled', async () => {
            await RecurringSubscription.query()
                .patch({
                    cancelledPickupWindows: [today.valueOf(), today.add(1, 'w').valueOf()],
                })
                .where({ id: subscription.id });
            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);
            let errorMessage;

            try {
                await rRuleService.cancelNextPickup();
            } catch (error) {
                errorMessage = error.message;
            }

            expect(errorMessage).to.equal("Sorry!! You can't cancel the next pickup");
        });

        it('should add next pickup to canceled pickup windows array and return it', async () => {
            await OrderDelivery.query()
                .patch({ status: orderDeliveryStatuses.COMPLETED })
                .where({ id: orderDelivery.id });
            const rRuleService = new RRuleService(subscription, timeZone);
            expect(subscription.cancelledPickupWindows).to.have.lengthOf(0);

            const newCanceledWindows = await rRuleService.cancelNextPickup();
            expect(newCanceledWindows).to.have.lengthOf(1);
            expect(
                toDateWithTimezone(newCanceledWindows[0], timeZone).startOf('day').valueOf(),
            ).to.equal(
                toDateWithTimezone(new Date(), timeZone).add(1, 'w').startOf('day').valueOf(),
            );
        });
    });

    describe('canCreateNextRecurringOrder prototype function', () => {
        it('should throw an error if there is an active pickup', async () => {
            const rRuleService = new RRuleService(subscription, timeZone);
            let errorMessage;

            try {
                await rRuleService.canCreateNextRecurringOrder();
            } catch (error) {
                errorMessage = error.message;
            }

            expect(errorMessage).to.equal(
                'Could not create order because there is an active pickup',
            );
        });

        it('should throw an error if there next pickup is canceled', async () => {
            await OrderDelivery.query()
                .patch({ status: orderDeliveryStatuses.COMPLETED })
                .where({ id: orderDelivery.id });
            await RecurringSubscription.query()
                .patch({
                    cancelledPickupWindows: [today.add(1, 'w').valueOf()],
                })
                .where({ id: subscription.id });
            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);
            let errorMessage;

            try {
                await rRuleService.canCreateNextRecurringOrder();
            } catch (error) {
                errorMessage = error.message;
            }

            expect(errorMessage).to.equal('Could not create order because next pickup is canceled');
        });

        it('should return false if the next pickup start time is not tomorrow', async () => {
            await OrderDelivery.query()
                .patch({ status: orderDeliveryStatuses.CANCELED })
                .where({ id: orderDelivery.id });

            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);

            expect(await rRuleService.canCreateNextRecurringOrder()).to.be.false;
        });

        it('should return true if the next pickup start time is tomorrow', async () => {
            tomorrowMinusOneWeek = toDateWithTimezone(new Date(), timeZone)
                .add(1, 'day')
                .startOf('day')
                .subtract(1, 'w');
            const deliveryWindow = [
                tomorrowMinusOneWeek.set({ hour: 10 }).valueOf(),
                tomorrowMinusOneWeek.set({ hour: 11 }).valueOf(),
            ];
            await OrderDelivery.query()
                .patch({
                    status: orderDeliveryStatuses.CANCELED,
                    deliveryWindow,
                })
                .where({ id: orderDelivery.id });
            await ServiceOrderRecurringSubscription.query()
                .patch({ pickupWindow: deliveryWindow })
                .where({ id: serviceOrderRecurringSubscription.id });

            subscription = await RecurringSubscription.query().findById(subscription.id);
            const rRuleService = new RRuleService(subscription, timeZone);

            expect(await rRuleService.canCreateNextRecurringOrder()).to.be.true;
        });

        describe('test next available pickup window', () => { 
            let orderDelivery2, tomorrowMinusTwoWeek, subscription2, serviceOrderRecurringSubscription2, order2, serviceOrder2, timing2
            beforeEach(async () => {
                const store = await factory.create('store');
                const timeZone = 'America/Los_Angeles';
                serviceOrder2 = await factory.create('serviceOrder', {
                    orderType: 'ONLINE',
                    status: 'READY_FOR_PROCESSING',
                    storeId: store.id,
                });
                order2 = await factory.create('order', {
                    orderableType: 'ServiceOrder',
                    orderableId: serviceOrder2.id,
                });
                const shift = await factory.create('shift', {
                    storeId: store.id,
                    type: SHIFT_TYPES.OWN_DELIVERY,
                });
                timing2 = await factory.create('timing', {
                    shiftId: shift.id,
                    startTime: '1970-01-01T10:00:00+00:00',
                    endTime: '1970-01-01T11:00:00+00:00',
                });
                tomorrowMinusTwoWeek = toDateWithTimezone(new Date(), timeZone).add(1, 'day').subtract(2, 'w').startOf('day');
                orderDelivery2 = await factory.create('orderDelivery', {
                    orderId: order2.id,
                    type: 'PICKUP',
                    status: orderDeliveryStatuses.COMPLETED,
                    timingsId: timing2.id,
                    deliveryWindow: [tomorrowMinusTwoWeek.set({ hour: 10 }).valueOf(), tomorrowMinusTwoWeek.set({ hour: 11 }).valueOf()],
                });
                subscription2 = await factory.create('recurringSubscription', {
                    storeId: store.id,
                    pickupTimingsId: timing2.id,
                    pickupWindow: [tomorrowMinusTwoWeek.set({ hour: 10 }).valueOf(), tomorrowMinusTwoWeek.set({ hour: 11 }).valueOf()],
                });
                serviceOrderRecurringSubscription2 = await factory.create(
                    'serviceOrderRecurringSubscription',
                    {
                        recurringSubscriptionId: subscription2.id,
                        serviceOrderId: serviceOrder2.id,
                        pickupWindow: [
                            tomorrowMinusTwoWeek.set({ hour: 10 }).valueOf(),
                            tomorrowMinusTwoWeek.set({ hour: 11 }).valueOf(),
                        ],
                    },
                );
            })

            it('should return true if the next pickup start time is tomorrow and if the previous pickup was canceled', async () => {
                const tomorrowMinusOneWeek = toDateWithTimezone(new Date(), timeZone).add(1, 'day').subtract(1, 'w').startOf('day');
                const orderDelivery = await factory.create('orderDelivery', {
                    orderId: order2.id,
                    type: 'PICKUP',
                    status: orderDeliveryStatuses.CANCELED,
                    timingsId: timing2.id,
                    deliveryWindow: [tomorrowMinusOneWeek.set({ hour: 10 }).valueOf(), tomorrowMinusOneWeek.set({ hour: 11 }).valueOf()],
                });
                await RecurringSubscription.query()
                    .patch({
                        cancelledPickupWindows: [tomorrowMinusOneWeek.valueOf()],
                    })
                    .where({ id: subscription2.id });
                
                await factory.create(
                    'serviceOrderRecurringSubscription',
                    {
                        recurringSubscriptionId: subscription2.id,
                        serviceOrderId: serviceOrder2.id,
                        pickupWindow: [
                            tomorrowMinusOneWeek.set({ hour: 10 }).valueOf(),
                            tomorrowMinusOneWeek.set({ hour: 11 }).valueOf(),
                        ],
                    },
                );
    
                subscription2 = await RecurringSubscription.query().findById(subscription2.id);
                const rRuleService = new RRuleService(subscription2, timeZone);
    
                expect(await rRuleService.canCreateNextRecurringOrder()).to.be.true;
            })
        })
    });
});
