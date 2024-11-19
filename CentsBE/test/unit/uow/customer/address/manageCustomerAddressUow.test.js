require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const manageCustomerAddressUow = require('../../../../../uow/customer/address/manageCustomerAddressUow');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test manageCustomerAddressUow UOW test', () => {
    let store,
        centsCustomer,
        storeCustomer,
        address,
        payload;

    beforeEach(async () => {
        store = await factory.create(FN.store);

        centsCustomer = await factory.create(FN.centsCustomer);

        storeCustomer = await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });
    });

    it('should manage centsCustomerAddress', async () => {
        address = await factory.create(FN.centsCustomerAddress, {
            centsCustomerId: centsCustomer.id,
            googlePlacesId: '1234567890',
        });

        payload = {
            centsCustomerId: storeCustomer.centsCustomerId,
            customerAddressPayload: {
                ...address,
                googlePlacesId: address.googlePlacesId,
            },
        };

        const result = await manageCustomerAddressUow(payload);

        expect(result).to.have.property('centsCustomerAddress');
    });

    it('should not manage centsCustomerAddress', async () => {
        address = await factory.create(FN.centsCustomerAddress, {
            centsCustomerId: centsCustomer.id,
        });

        payload = {
            centsCustomerId: storeCustomer.centsCustomerId,
            customerAddressPayload: {
                ...address,
                googlePlacesId: '1234567890',
            },
        };

        const result = await manageCustomerAddressUow(payload);

        expect(result).to.have.property('centsCustomerAddress');
    });

    it('should fail to fetch for not passing the payload', async () => {
        payload = {}
        expect(manageCustomerAddressUow(payload)).rejectedWith(Error);
    });
}); 