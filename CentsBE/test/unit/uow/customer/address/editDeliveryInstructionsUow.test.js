require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const editDeliveryInstructions = require('../../../../../uow/customer/address/editDeliveryInstructionsUow');
const { FACTORIES_NAMES: FN } = require('../../../../constants/factoriesNames');

describe('test editDeliveryInstructions UOW test', () => {
    let store,
        centsCustomer,
        address,
        payload;

    it('should update instructions and leaveAtDoor', async () => {
        store = await factory.create(FN.store);

        centsCustomer = await factory.create(FN.centsCustomer);

        await factory.create(FN.storeCustomer, {
            storeId: store.id,
            centsCustomerId: centsCustomer.id,
        });

        address = await factory.create(FN.centsCustomerAddress, {
            centsCustomerId: centsCustomer.id,
        });

        payload = {
            leaveAtDoor: true,
            instructions: 'call upon arrival',
            customerAddressId: address.id,
        };

        const result = await editDeliveryInstructions(payload);

        expect(result).to.have.property('instructions').equal(payload.instructions);
        expect(result).to.have.property('leaveAtDoor').equal(payload.leaveAtDoor);
    });

    it('should fail to fetch for not passing the payload', async () => {
        payload = {}
        expect(editDeliveryInstructions(payload)).rejectedWith(Error);
    });
}); 