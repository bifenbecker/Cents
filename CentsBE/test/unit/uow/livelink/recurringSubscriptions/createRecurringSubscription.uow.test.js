require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');

const createRecurringSubscription = require('../../../../../uow/delivery/onlineOrder/createRecurringSubscription');

const factory = require('../../../../factories');

describe('test create recurring subscription uow', () => {
    let store, payload, centsCustomer, centsCustomerAddress, timings, servicePrice;

    beforeEach(async () => {
        store = await factory.create('store');
        servicePrice = await factory.create('servicePrice');
        timings = await factory.create('timing');
        centsCustomer = await factory.create('centsCustomer');
        centsCustomerAddress = await factory.create('centsCustomerAddress', {
            centsCustomerId: centsCustomer.id,
        });

        payload = {
            storeId: store.id,
            centsCustomer,
            centsCustomerAddressId: centsCustomerAddress.id,
            subscription: {
                servicePriceId: servicePrice.id,
                interval: 1,
                pickupWindow: ['1631043000000', '1631057400000'],
                returnWindow: ['1620907200000', '1620921600000'],
                modifierIds: [],
                pickupTimingsId: timings.id,
            },
            settings: {
                timeZone: 'America/Los_Angeles',
            },
        };
    });
    it('should create recurring subscription', async () => {
        let subscription = await createRecurringSubscription(payload);
        expect(subscription.recurringSubscription).to.have.property('storeId').equal(store.id);
        expect(subscription.recurringSubscription.returnWindow)
            .to.be.an('array')
            .that.include('1620907200000', '1620921600000');
    });

    it('should throw error for not passing the payload', async () => {
        expect(createRecurringSubscription({})).rejectedWith(Error);
    });
});
