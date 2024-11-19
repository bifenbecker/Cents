require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');

const listSubscriptionsUow = require('../../../../../uow/liveLink/serviceOrders/listSubscriptionsUow');

const factory = require('../../../../factories');

describe('test create recurring subscription uow', () => {
    let payload,
        centsCustomer,
        store,
        recurringSubscription,
        centsCustomerAddress,
        shift,
        timing,
        servicePrice,
        serviceOrder,
        order,
        serviceOrderRecurringSubscription,
        orderDelivery;

    beforeEach(async () => {
        store = await factory.create('store');
        centsCustomer = await factory.create('centsCustomer');
        centsCustomerAddress = await factory.create('centsCustomerAddress', {
            centsCustomerId: centsCustomer.id,
        });
        shift = await factory.create('shift', { storeId: store.id });
        timing = await factory.create('timing', { shiftId: shift.id });
        servicePrice = await factory.create('servicePrice');
        recurringSubscription = await factory.create('recurringSubscription', {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
            centsCustomerAddressId: centsCustomerAddress.id,
            pickupTimingsId: timing.id,
            returnTimingsId: timing.id,
            servicePriceId: servicePrice.id,
            modifierIds: [],
        });
        serviceOrder = await factory.create('serviceOrder', {
            orderType: 'ONLINE',
            status: 'READY_FOR_PROCESSING',
        });
        order = await factory.create('order', {
            orderableType: 'ServiceOrder',
            orderableId: serviceOrder.id,
        });
        serviceOrderRecurringSubscription = await factory.create(
            'serviceOrderRecurringSubscription',
            {
                recurringSubscriptionId: recurringSubscription.id,
                serviceOrderId: serviceOrder.id,
            },
        );
        orderDelivery = await factory.create('orderDelivery', {
            orderId: order.id,
            type: 'PICKUP',
            status: 'SCHEDULED',
        });
        timeZone = 'America/Los_Angeles';
        payload = {
            centsCustomer,
        };
    });
    it('should get list of recurring subscriptions with cu', async () => {
        let subscriptions = await listSubscriptionsUow(payload);
        expect(subscriptions)
            .to.have.property('formattedResponse')
            .to.be.an('array')
            .to.have.lengthOf(1);
        expect(subscriptions.formattedResponse[0]).to.have.property('frequency').to.equal('WEEKLY');
    });
});
