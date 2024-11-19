require('../../../../testHelper');
const moment = require('moment-timezone');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const fetchStoresSubscriptionList = require('../../../../../uow/reports/subscriptionsList/fetchStoresSubscriptionsList');
const StoreSettings = require('../../../../../models/storeSettings');
const RRuleService = require('../../../../../services/rruleService');
const { statuses, orderDeliveryStatuses } = require('../../../../../constants/constants');

function createCentsCustomer() {
    return factory.create('centsCustomer', {
        firstName: 'subscription',
        lastName: 'customer',
        phoneNumber: '4645454563',
        email: 'subscriptionCustomer@gmail.com',
    });
}

function createStoreCustomer(centsCustomer, store) {
    const { id: storeId, businessId } = store;
    return factory.create('storeCustomer', {
        centsCustomerId: centsCustomer.id,
        storeId,
        businessId,
        firstName: centsCustomer.firstName,
        lastName: centsCustomer.lastName,
        email: centsCustomer.email,
        phoneNumber: centsCustomer.phoneNumber,
    });
}

function createCustomerAddress(centsCustomerId) {
    return factory.create('centsCustomerAddress', {
        address1: '399 Drake Avenue',
        city: 'Monterey',
        firstLevelSubdivisionCode: 'CA',
        postalCode: '93940',
        countryCode: 'US',
        centsCustomerId,
    });
}

function createServiceOrder({
    storeId,
    storeCustomerId,
    createCanceledOrder,
    netOrderTotal = 10,
    completedOrder,
}) {
    return factory.create('serviceOrder', {
        storeId,
        storeCustomerId,
        netOrderTotal,
        orderType: 'ONLINE',
        status: createCanceledOrder
            ? statuses.CANCELLED
            : completedOrder
            ? statuses.COMPLETED
            : statuses.SUBMITTED,
    });
}

function createOrder({ storeId, serviceOrderId }) {
    return factory.create('order', {
        storeId,
        orderableId: serviceOrderId,
        orderableType: 'ServiceOrder',
    });
}

function createOrderDelivery({
    orderId,
    storeId,
    storeCustomerId,
    centsCustomerAddressId,
    deliveryWindow,
    type,
    status = orderDeliveryStatuses.SCHEDULED,
}) {
    return factory.create('orderDelivery', {
        orderId,
        storeId,
        storeCustomerId,
        centsCustomerAddressId,
        type,
        deliveryWindow,
        status,
    });
}

function createOwnDeliverySettings(storeId, hasZones = true) {
    return factory.create('ownDeliverySetting', {
        hasZones,
        storeId,
    });
}

function createZones(payload) {
    return Promise.all(payload.map((zone) => factory.create('zone', zone)));
}

function createServiceOrderRecurringSubscription({ recurringSubscriptionId, serviceOrderId }) {
    return factory.create('serviceOrderRecurringSubscription', {
        recurringSubscriptionId,
        serviceOrderId,
    });
}

async function createRecurringSubscription(payload) {
    const servicePrice = await factory.create('servicePrice');
    payload.servicePriceId = servicePrice.id;
    return factory.create('recurringSubscription', payload);
}

async function createOnlineRecurringSubscriptionOrder({
    recurringSubscriptionId,
    storeId,
    storeCustomerId,
    centsCustomerAddressId,
    pickupWindow,
    returnWindow,
    createCanceledOrder = false,
    netOrderTotal,
    completedOrder = false,
}) {
    const serviceOrder = await createServiceOrder({
        storeId,
        storeCustomerId,
        createCanceledOrder,
        netOrderTotal,
        completedOrder,
    });
    await createServiceOrderRecurringSubscription({
        recurringSubscriptionId,
        serviceOrderId: serviceOrder.id,
    });
    const order = await createOrder({
        storeId,
        serviceOrderId: serviceOrder.id,
    });
    const orderDeliveryPayload = {
        storeCustomerId,
        storeId,
        orderId: order.id,
        centsCustomerAddressId,
        deliveryWindow: pickupWindow,
        type: 'PICKUP',
        status: completedOrder ? orderDeliveryStatuses.COMPLETED : orderDeliveryStatuses.SCHEDULED,
    };
    await createOrderDelivery(orderDeliveryPayload);
    if (returnWindow && returnWindow.length) {
        await createOrderDelivery({
            ...orderDeliveryPayload,
            type: 'RETURN',
            deliveryWindow: returnWindow,
        });
    }
}

describe('fetch subscriptions list', () => {
    let storeId;
    let recurringSubscription;
    let storeCustomerId;
    let centsCustomerId;
    let centsCustomerAddressId;
    const timeZone = 'America/Los_Angeles';
    beforeEach(async () => {
        const store = await factory.create('store', { name: 'test location' });
        storeId = store.id;
        const centsCustomer = await createCentsCustomer();
        centsCustomerId = centsCustomer.id;
        const customerAddress = await createCustomerAddress(centsCustomer.id);
        centsCustomerAddressId = customerAddress.id;
        const storeCustomer = await createStoreCustomer(centsCustomer, store);
        storeCustomerId = storeCustomer.id;
        await StoreSettings.query()
            .patch({
                timeZone,
            })
            .where('storeId', storeId);
        const pickupWindow = [
            moment
                .tz('2022-05-12 10:00:00 AM', 'YYYY-MM-DD hh:mm:ss p', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-12 11:00:00 AM', 'YYYY-MM-DD hh:mm:ss p', 'America/Los_Angeles')
                .valueOf(),
        ];
        recurringSubscription = await createRecurringSubscription({
            pickupWindow,
            returnWindow: [],
            centsCustomerId,
            centsCustomerAddressId,
            storeId,
            recurringRule: RRuleService.generateRule(
                1,
                moment('2022-05-12').day(),
                new Date('2022-05-12'),
            ),
        });
        await createOnlineRecurringSubscriptionOrder({
            recurringSubscriptionId: recurringSubscription.id,
            storeId,
            storeCustomerId,
            centsCustomerAddressId,
            pickupWindow,
        });
    });
    it('should return array of all active subscriptions', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0])
            .to.have.property('customerName')
            .to.equal('subscription customer');
        const expectedkeys = [
            'customerName',
            'frequency',
            'pickupDay',
            'deliveryDay',
            'totalOrdersValue',
            'avgOrderValue',
            'nextPickup',
            'pickupWindow',
            'deliveryWindow',
            'locationName',
            'deliveryZone',
            'serviceType',
            'startedDate',
        ];
        expect(Object.keys(subscriptionsList[0])).to.deep.equal(expectedkeys);
    });

    it('subscription should have a frequency of week', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('frequency').to.equal('Weekly');
    });

    it('subscription should have deliveryDay to equal text when ready since there is no delivery selected for the subscription', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('deliveryDay').to.equal('Text when ready');
    });

    it('subscription should have totalOrdersValue of $10', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('totalOrdersValue').to.equal('$10.00');
    });

    it('subscription should have avgOrderValue of $10', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('avgOrderValue').to.equal('$10.00');
    });

    it('should have pickupDay as Thursday', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('pickupDay').to.equal('Thursday');
    });

    it('should return pcikup Window of the subscription', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0])
            .to.have.property('pickupWindow')
            .to.equal('10:00 AM - 11:00 AM');
    });

    it(`should return 'nextPickup' as today since the pickup is still active`, async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList[0]).to.have.property('nextPickup').to.equal('05/12/2022');
    });

    it(`should return locationName as store name`, async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList[0]).to.have.property('locationName').to.equal('test location');
    });

    describe('customer has multiple subscriptions', () => {
        beforeEach(async () => {
            const pickupWindow = [
                moment
                    .tz('2022-05-13 13:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                    .valueOf(),
                moment
                    .tz('2022-05-13 14:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                    .valueOf(),
            ];
            const otherRecurringSubscription = await createRecurringSubscription({
                pickupWindow,
                returnWindow: [
                    moment
                        .tz(
                            '2022-05-15 13:00:00 PM',
                            'YYYY-MM-DD HH:mm:ss P',
                            'America/Los_Angeles',
                        )
                        .valueOf(),
                    moment
                        .tz(
                            '2022-05-15 14:00:00 PM',
                            'YYYY-MM-DD HH:mm:ss P',
                            'America/Los_Angeles',
                        )
                        .valueOf(),
                ],
                centsCustomerId,
                centsCustomerAddressId,
                storeId,
                recurringRule: RRuleService.generateRule(
                    2,
                    moment('2022-05-12').day(),
                    new Date('2022-05-12'),
                ),
            });
            await createOnlineRecurringSubscriptionOrder({
                recurringSubscriptionId: otherRecurringSubscription.id,
                storeId,
                storeCustomerId,
                centsCustomerAddressId,
                pickupWindow,
                netOrderTotal: 20,
            });
        });

        it('should return multiple subscriptions existing for the customer', async () => {
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList).to.be.an('array').of.length(2);
        });

        it('second subscription should have a frequency of 2 weeks', async () => {
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList).to.be.an('array').of.length(2);
            expect(subscriptionsList[1]).to.have.property('frequency').to.equal('2 Weeks');
        });

        it('should sort subscriptions based on pickup day (Monday, tuesday, wednesday)', async () => {
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList).to.be.an('array').of.length(2);
            expect(subscriptionsList.map((s) => s.pickupDay)).to.eql(['Thursday', 'Friday']);
        });

        it('subscriptions should have a totalOrdersValue of 10 and 20 dollars', async () => {
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList).to.be.an('array').of.length(2);
            expect(subscriptionsList.map((s) => s.totalOrdersValue)).to.eql(['$10.00', '$20.00']);
        });
    });

    describe('subscriptions for stores with out zones', () => {
        it(`should have 'deliveryZone' as 'Default' since the store does not have any zones`, async () => {
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList[0]).to.have.property('deliveryZone').to.equal('Default');
        });
    });

    describe('subscriptions of stores with zones', () => {
        it('should return the deliveryZone name if the store has zones and if the pickup address postal code falls in the store zones', async () => {
            const { id: ownDeliverySettingsId } = await createOwnDeliverySettings(
                storeId,
                true,
            );
            await createZones([
                {
                    name: 'monterey',
                    zipCodes: [93940, 93942],
                    ownDeliverySettingsId,
                },
                {
                    name: 'monterey2',
                    zipCodes: [93943, 93944],
                    ownDeliverySettingsId,
                },
            ]);
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList[0]).to.have.property('deliveryZone').to.equal('monterey');
        });

        it('should return deliveryZone as Default if the store has zones but the pickup address does not fall under the zone', async () => {
            const { id: ownDeliverySettingsId } = await createOwnDeliverySettings(storeId, true);
            await createZones([
                {
                    name: 'monterey2',
                    zipCodes: [93943, 93944],
                    ownDeliverySettingsId,
                },
            ]);
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList[0]).to.have.property('deliveryZone').to.equal('Default');
        });
    });

    describe('subscriptions with out return delivery', () => {
        it(`should have 'deliveryDay' and 'deliveryWindow' as 'Text when ready' since the subscription does not have any delivery selected`, async () => {
            const { subscriptionsList } = await fetchStoresSubscriptionList({
                options: { stores: [storeId] },
            });
            expect(subscriptionsList[0])
                .to.have.property('deliveryDay')
                .to.equal('Text when ready');
            expect(subscriptionsList[0])
                .to.have.property('deliveryWindow')
                .to.equal('Text when ready');
        });
    });
});

describe('subscriptions with return delivery', () => {
    let storeId;
    let recurringSubscription;
    let storeCustomerId;
    let centsCustomerId;
    let centsCustomerAddressId;
    const timeZone = 'America/Los_Angeles';
    let returnWindow;
    beforeEach(async () => {
        const store = await factory.create('store', { name: 'test location' });
        storeId = store.id;
        const centsCustomer = await createCentsCustomer({
            firstName: 'john',
            lastName: 'customer',
            phoneNumber: '3434343434',
            email: 'subscriptionCustomer@gmail.com',
        });
        centsCustomerId = centsCustomer.id;
        const customerAddress = await createCustomerAddress(centsCustomer.id);
        centsCustomerAddressId = customerAddress.id;
        const storeCustomer = await createStoreCustomer(centsCustomer, store);
        storeCustomerId = storeCustomer.id;
        await StoreSettings.query()
            .patch({
                timeZone,
            })
            .where('storeId', storeId);
        const pickupWindow = [
            moment
                .tz('2022-05-13 13:00:00 PM', 'YYYY-MM-DD HH:mm:ss A', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-13 14:00:00 PM', 'YYYY-MM-DD HH:mm:ss A', 'America/Los_Angeles')
                .valueOf(),
        ];
        returnWindow = [
            moment
                .tz('2022-05-16 13:00:00 PM', 'YYYY-MM-DD HH:mm:ss A', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-16 14:00:00 PM', 'YYYY-MM-DD HH:mm:ss A', 'America/Los_Angeles')
                .valueOf(),
        ];
        recurringSubscription = await createRecurringSubscription({
            pickupWindow,
            returnWindow,
            centsCustomerId,
            centsCustomerAddressId,
            storeId,
            recurringRule: RRuleService.generateRule(
                1,
                moment('2022-05-13').day(),
                new Date('2022-05-13'),
            ),
        });
        await createOnlineRecurringSubscriptionOrder({
            recurringSubscriptionId: recurringSubscription.id,
            storeId,
            storeCustomerId,
            centsCustomerAddressId,
            pickupWindow,
            returnWindow,
        });
    });
    it(`should return deliveryDay as returnDelivery day if subscription has return delivery`, async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('deliveryDay').to.equal('Monday');
    });

    it(`should return deliveryWindow if subscription has return delivery`, async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0])
            .to.have.property('deliveryWindow')
            .to.equal('01:00 PM - 02:00 PM');
    });
});

describe('subscriptions with cancelled orders', () => {
    let storeId;
    let recurringSubscription;
    let storeCustomerId;
    let centsCustomerId;
    let centsCustomerAddressId;
    const timeZone = 'America/Los_Angeles';
    beforeEach(async () => {
        const store = await factory.create('store', { name: 'test location' });
        storeId = store.id;
        const centsCustomer = await createCentsCustomer({
            firstName: 'jack',
            lastName: 'sparrow',
            phoneNumber: '5456567655',
            email: 'jacksparrow@gmail.com',
        });
        centsCustomerId = centsCustomer.id;
        const customerAddress = await createCustomerAddress(centsCustomer.id);
        centsCustomerAddressId = customerAddress.id;
        const storeCustomer = await createStoreCustomer(centsCustomer, store);
        storeCustomerId = storeCustomer.id;
        const timings = await factory.create('timing');
        const storeSettings = await StoreSettings.query()
            .patch({
                timeZone,
            })
            .where('storeId', storeId);
        const pickupWindow = [
            moment
                .tz('2022-05-13 13:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-13 14:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                .valueOf(),
        ];
        const returnWindow = [
            moment
                .tz('2022-05-16 13:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-16 14:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                .valueOf(),
        ];
        recurringSubscription = await createRecurringSubscription({
            pickupWindow,
            returnWindow,
            centsCustomerId,
            centsCustomerAddressId,
            storeId,
            recurringRule: RRuleService.generateRule(
                1,
                moment('2022-05-13').day(),
                new Date('2022-05-13'),
            ),
        });
        await createOnlineRecurringSubscriptionOrder({
            recurringSubscriptionId: recurringSubscription.id,
            storeId,
            storeCustomerId,
            centsCustomerAddressId,
            pickupWindow,
            returnWindow,
            createCanceledOrder: true,
        });
    });

    it(`should return 'totalOrdersValue' and 'avgOrderValue' as null`, async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(1);
        expect(subscriptionsList[0]).to.have.property('totalOrdersValue').to.equal(null);
        expect(subscriptionsList[0]).to.have.property('avgOrderValue').to.equal(null);
    });
});

describe('cancelled subscriptions', () => {
    let storeId;
    let recurringSubscription;
    let storeCustomerId;
    let centsCustomerId;
    let centsCustomerAddressId;
    const timeZone = 'America/Los_Angeles';
    beforeEach(async () => {
        const store = await factory.create('store', { name: 'test location' });
        storeId = store.id;
        const centsCustomer = await createCentsCustomer();
        centsCustomerId = centsCustomer.id;
        const customerAddress = await createCustomerAddress(centsCustomer.id);
        centsCustomerAddressId = customerAddress.id;
        const storeCustomer = await createStoreCustomer(centsCustomer, store);
        storeCustomerId = storeCustomer.id;
        const storeSettings = await StoreSettings.query()
            .patch({
                timeZone,
            })
            .where('storeId', storeId);
        const pickupWindow = [
            moment
                .tz('2022-05-13 13:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-13 14:00:00 PM', 'YYYY-MM-DD HH:mm:ss P', 'America/Los_Angeles')
                .valueOf(),
        ];
        recurringSubscription = await createRecurringSubscription({
            pickupWindow,
            returnWindow: [],
            centsCustomerId,
            centsCustomerAddressId,
            storeId,
            recurringRule: RRuleService.generateRule(
                1,
                moment('2022-05-13').day(),
                new Date('2022-05-13'),
            ),
            deletedAt: new Date(),
        });
        await createOnlineRecurringSubscriptionOrder({
            recurringSubscriptionId: recurringSubscription.id,
            storeId,
            storeCustomerId,
            centsCustomerAddressId,
            pickupWindow,
        });
    });
    it('should only return active subscriptions', async () => {
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        expect(subscriptionsList).to.be.an('array').of.length(0);
    });
});

describe('subscriptions with completed orders', () => {
    let storeId;
    let recurringSubscription;
    let storeCustomerId;
    let centsCustomerId;
    let centsCustomerAddressId;
    const timeZone = 'America/Los_Angeles';
    beforeEach(async () => {
        const store = await factory.create('store', { name: 'test location' });
        storeId = store.id;
        const centsCustomer = await createCentsCustomer();
        centsCustomerId = centsCustomer.id;
        const customerAddress = await createCustomerAddress(centsCustomer.id);
        centsCustomerAddressId = customerAddress.id;
        const storeCustomer = await createStoreCustomer(centsCustomer, store);
        storeCustomerId = storeCustomer.id;
        await StoreSettings.query()
            .patch({
                timeZone,
            })
            .where('storeId', storeId);
        const pickupWindow = [
            moment
                .tz('2022-05-12 10:00:00 AM', 'YYYY-MM-DD hh:mm:ss p', 'America/Los_Angeles')
                .valueOf(),
            moment
                .tz('2022-05-12 11:00:00 AM', 'YYYY-MM-DD hh:mm:ss p', 'America/Los_Angeles')
                .valueOf(),
        ];
        recurringSubscription = await createRecurringSubscription({
            pickupWindow,
            returnWindow: [],
            centsCustomerId,
            centsCustomerAddressId,
            storeId,
            recurringRule: RRuleService.generateRule(
                1,
                moment.tz('2022-05-12', 'America/Los_Angeles').day(),
                new Date('2022-05-12'),
            ),
        });
        await createOnlineRecurringSubscriptionOrder({
            recurringSubscriptionId: recurringSubscription.id,
            storeId,
            storeCustomerId,
            centsCustomerAddressId,
            pickupWindow,
            completedOrder: true,
        });
    });

    it('should return nextPickup as date in the future with weekly freequency if the next pickup is in the past', async () => {
        const currentDate = moment.tz('America/Los_Angeles');
        const { subscriptionsList } = await fetchStoresSubscriptionList({
            options: { stores: [storeId] },
        });
        let expectedPickupDate = moment.tz('2022-05-19', 'America/Los_Angeles');
        if (currentDate.valueOf() >= expectedPickupDate.valueOf()) {
            while (expectedPickupDate.valueOf() <= currentDate.valueOf()) {
                expectedPickupDate = expectedPickupDate.add(1, 'w');
            }
        }
        expect(subscriptionsList[0])
            .to.have.property('nextPickup')
            .to.equal(expectedPickupDate.format('MM/DD/YYYY'));
    });
});
