require('../../../../testHelper');
const faker = require('faker');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const updatePhoneNumber = require('../../../../../uow/customer/phone/updatePhoneNumberUow');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test updatePhoneNumber UOW test', () => {
    let store,
        centsCustomer,
        storeCustomer,
        payload;

    it('should update phoneNumber', async () => {
        store = await factory.create(FN.store);

        centsCustomer = await factory.create(FN.centsCustomer);

        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });

        payload = {
            phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
            centsCustomerId: storeCustomer.centsCustomerId,
        };

        const result = await updatePhoneNumber(payload);

        expect(result).to.have.property('phoneNumber').equal(payload.phoneNumber);
    });

    it('should fail to fetch for not passing the payload', async () => {
        payload = {}
        expect(updatePhoneNumber(payload)).rejectedWith(Error);
    });
}); 