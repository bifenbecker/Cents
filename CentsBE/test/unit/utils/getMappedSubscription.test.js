require('../../testHelper');
const { expect } = require('../../support/chaiHelper');
const factory = require('../../factories');
const { FACTORIES_NAMES: FN } = require('../../constants/factoriesNames');
const getMappedSubscription = require('../../../utils/getMappedSubscription');
const { SHIFT_TYPES } = require('../../../lib/constants');
const StoreSettings = require('../../../models/storeSettings');
const { toDateWithTimezone, formatDeliveryWindow } = require('../../../helpers/dateFormatHelper');
const RecurringSubscription = require('../../../models/recurringSubscription');
const { orderDeliveryStatuses } = require('../../../constants/constants');

async function getSubscription(id) {
    return RecurringSubscription.query()
        .withGraphJoined('[store.settings,address]')
        .findById(id);
}

describe('test getMappedSubscription', () => { 

    describe('with out cancelledPickupWindows', () => { 
        let subscription, today, pickupWindow
        const timeZone = 'America/Los_Angeles'
        beforeEach(async () => {
            const store = await factory.create('store')
            await StoreSettings.query().patch({
                timeZone
            }).where('storeId', store.id)
            const shift = await factory.create('shift', {
                storeId: store.id,
                type: SHIFT_TYPES.OWN_DELIVERY,
            });
            const timing = await factory.create('timing', {
                shiftId: shift.id,
                startTime: '1970-01-01T10:00:00+00:00',
                endTime: '1970-01-01T11:00:00+00:00',
            });
            today = toDateWithTimezone(new Date(), timeZone).startOf('day');

            const recurringSubscription = await factory.create('recurringSubscription', {
                storeId: store.id,
                pickupTimingsId: timing.id,
                pickupWindow: [today.set({ hour: 10 }).valueOf(), today.set({ hour: 11 }).valueOf()],
            });
            serviceOrder = await factory.create('serviceOrder', {
                orderType: 'ONLINE',
                status: 'READY_FOR_PROCESSING',
                storeId: store.id,
            });
            order = await factory.create('order', {
                orderableType: 'ServiceOrder',
                orderableId: serviceOrder.id,
            });
            orderDelivery = await factory.create('orderDelivery', {
                orderId: order.id,
                type: 'PICKUP',
                status: 'SCHEDULED',
                timingsId: timing.id,
                deliveryWindow: [today.set({ hour: 10 }).valueOf(), today.set({ hour: 11 }).valueOf()],
            });
            subscription = await getSubscription(recurringSubscription.id)
            pickupWindow = [
                today.set({ hour: 10 }).valueOf(),
                today.set({ hour: 11 }).valueOf(),
            ]
            const todayPlusTwoDays = toDateWithTimezone(new Date(), timeZone).startOf('day').add(2, 'days')
            returnWindow = [
                todayPlusTwoDays.set({ hour: 10 }).valueOf(),
                todayPlusTwoDays.set({ hour: 11 }).valueOf(),
            ]
            serviceOrderRecurringSubscription = await factory.create(
                'serviceOrderRecurringSubscription',
                {
                    recurringSubscriptionId: subscription.id,
                    serviceOrderId: serviceOrder.id,
                    pickupWindow,
                },
            );
        })

        it('should return subscription details', async () => {
            const result = await getMappedSubscription(subscription)
            expect(Object.keys(result)).to.deep.eq([
                'recurringSubscriptionId',
                'pickupTimingsId',
                'deliveryTimingsId',
                'pickupWindow',
                'returnWindow',
                'centsCustomerId',
                'centsCustomerAddress',
                'servicePriceId',
                'modifierIds',
                'paymentToken',
                'cancelledPickupWindows',
                'frequency',
                'pickup',
                'delivery',
                'nextPickupDatetime',
                'nextAvailablePickup',
                'isNextPickupCancelled',
                'recurringDiscountInPercent',
                'interval',
                'canCancelPickup'
            ])
        })

        it('should return nextAvailablePickupWindow as orderdelivery pickupWindow since it is still in scheduled status', async () => {
            const nextAvailablePickup = formatDeliveryWindow(pickupWindow, timeZone, {
                dateFormat: 'dddd, MMMM Do',
            });
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('nextAvailablePickup').to.equal(nextAvailablePickup)
        })

        it('should return nextAvailablePickupWindow as orderdelivery pickupWindow since it is still in scheduled status', async () => {
            const nextPickupDatetime = formatDeliveryWindow(pickupWindow, timeZone, {
                dateFormat: 'MM/DD',
            });
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('nextPickupDatetime').to.equal(nextPickupDatetime)
        })

        it('should have recurringSubscriptionId property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('recurringSubscriptionId').to.equal(subscription.id)
        })

        it('should have pickupTimingsId property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('pickupTimingsId').to.equal(subscription.pickupTimingsId)
        })

        it('should have pickupWindow property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('pickupWindow').to.deep.eq([
                pickupWindow[0].toString(),
                pickupWindow[1].toString()
            ])
        })

        it('should have centsCustomerId property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('centsCustomerId').to.equal(subscription.centsCustomerId)
        })

        it('should have frequency property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('frequency').to.equal('WEEKLY')
        })

        it('should have isNextPickupCancelled property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('isNextPickupCancelled').to.be.false
        })

        it('should have recurringDiscountInPercent property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('recurringDiscountInPercent').to.equal(0)
        })

        it('should have interval property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('interval').to.equal(1)
        })

        it('it should have canCancelPickup property in the result', async () => {
            const result = await getMappedSubscription(subscription)
            expect(result).to.have.property('canCancelPickup').to.equal(false)
        })
        
        describe('if return method is in-store pickup', () => { 
            beforeEach(async () => {
                await RecurringSubscription.query().patch({
                    returnWindow: [],
                    returnTimingsId: null
                }).where('id', subscription.id)
                subscription = await getSubscription(subscription.id)
            })

            it("should have delivery property in the result and should be 'Text me when it's ready'", async () => {
                const result = await getMappedSubscription(subscription)
                expect(result).to.have.property('delivery').to.equal("Text me when it's ready")
            })
        })
    })

    describe('with cancelledPickupWindows', () => {
        let orderDelivery2, tomorrowMinusTwoWeek, subscription2, serviceOrderRecurringSubscription2, order2, serviceOrder2, timing2
        const timeZone = 'America/Los_Angeles';
        beforeEach(async () => {
            const store = await factory.create('store');
            await StoreSettings.query().patch({
                timeZone
            }).where('storeId', store.id)
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
            subscription2 = await getSubscription(subscription2.id)
        })

        it('should return nextPickupDatetime', async () => {
            const tomorrow = toDateWithTimezone(new Date(), timeZone).startOf('day').add(1, 'd');
            const result = await getMappedSubscription(subscription2)
            const nextPickupDatetime = formatDeliveryWindow(
                [
                    tomorrow.set({ hour: 10 }).valueOf(),
                    tomorrow.set({ hour: 11 }).valueOf(),
                ]
            , timeZone, {
                dateFormat: 'MM/DD',
            });
            expect(result).to.have.property('nextPickupDatetime').to.equal(nextPickupDatetime)
        })
    })
    
})
