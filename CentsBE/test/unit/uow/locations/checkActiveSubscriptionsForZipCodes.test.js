require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const checkActiveSubscriptionsForZipCode = require('../../../../uow/locations/checkActiveSubscriptionsForZipCode');
const factory = require('../../../factories');

describe('test checkActiveSubscriptionsForZipCodes uow', async () => {
    let centsCustomerAddress, response;
    beforeEach(async () => {
        centsCustomerAddress = await factory.create('centsCustomerAddress', {
            postalCode: '10003',
        });
    });

    it('should return zipcodes for active subscriptions', async () => {
        const recurringSubscription = await factory.create('recurringSubscription', {
            centsCustomerAddressId: centsCustomerAddress.id,
        });
        response = await checkActiveSubscriptionsForZipCode({
            zipCodes: ['10003'],
            storeId: recurringSubscription.storeId,
        });
        expect(response).to.have.a.property('zipCodesForRecurringSubscription').to.be.an('array');
        expect(response.zipCodesForRecurringSubscription).to.be.deep.equal(['10003']);
    });

    it('should return empty array of zipcodes for deleted subscriptions', async () => {
        const recurringSubscription = await factory.create('recurringSubscription', {
            centsCustomerAddressId: centsCustomerAddress.id,
            deletedAt: new Date(),
        });
        response = await checkActiveSubscriptionsForZipCode({
            zipCodes: ['10003'],
            storeId: recurringSubscription.storeId,
        });
        expect(response).to.have.a.property('zipCodesForRecurringSubscription').to.be.an('array');
        expect(response.zipCodesForRecurringSubscription).to.be.empty;
    });

    it('should return empty array of zipcodes for no subscriptions on zipcode sent', async () => {
        const recurringSubscription = await factory.create('recurringSubscription', {
            centsCustomerAddressId: centsCustomerAddress.id,
        });
        response = await checkActiveSubscriptionsForZipCode({
            zipCodes: ['10002'],
            storeId: recurringSubscription.storeId,
        });
        expect(response).to.have.a.property('zipCodesForRecurringSubscription').to.be.an('array');
        expect(response.zipCodesForRecurringSubscription).to.be.empty;
    });

    it('should return empty array of zipcodes for active subscriptions which are part of another business', async () => {
        const store = await factory.create('store');
        const anotherStore = await factory.create('store');
        await factory.create('recurringSubscription', {
            centsCustomerAddressId: centsCustomerAddress.id,
            storeId: anotherStore.id,
        });

        // Verifying if the stores and businesses are different
        expect(store.id).not.equal(anotherStore.id);
        expect(store.businessId).not.equal(anotherStore.businessId);

        response = await checkActiveSubscriptionsForZipCode({
            zipCodes: ['10003'],
            storeId: store.id,
        });
        expect(response).to.have.a.property('zipCodesForRecurringSubscription').to.be.an('array');
        expect(response.zipCodesForRecurringSubscription).to.be.empty;
    });

    it('should throw error for not passing the payload', async () => {
        expect(checkActiveSubscriptionsForZipCode()).rejectedWith(Error);
    });
});
