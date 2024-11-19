require('../../../../testHelper');
const { chai, expect } = require('../../../../support/chaiHelper');
const { 
    createCustomerAddressRecord,
    createPayload,
    assertCustomerAddressRecord,
    assertMissingDataRejections,
    assertNotNullRestrictions,
} = require('../../../../support/customerAddressHelper');
const factory = require('../../../../factories');
const eventEmitter = require('../../../../../config/eventEmitter');
const createCustomerAddress = require('../../../../../uow/customer/address/createCustomerAddressUow');

const EVENT_CUSTOMER_ADDRESS_CREATED = 'customerAddressCreated';

describe('test createCustomerAddressUow', () => {
    let centsCustomer;
    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer', { firstName: 'John' });
    });

    it('should successfully create new customer address and dispatch corresponding event', async () => {
        const payload = createPayload(centsCustomer.id);

        const spy = chai.spy(() => {});
        eventEmitter.once(EVENT_CUSTOMER_ADDRESS_CREATED, spy);

        const res = await createCustomerAddress({...payload});
        expect(res).to.be.eql({
            ...payload,
            centsCustomerAddressId: res.centsCustomerAddressId,
            customerAddress: res.customerAddress,
        });
        expect(res.centsCustomerAddressId).to.satisfy(Number.isInteger);

        // validate customerAddress
        const expectedCustomerAddress = createCustomerAddressRecord(
            {
                ...payload.address,
                googlePlacesId: payload.googlePlacesId,
            }, 
            res.customerAddress
        );
        assertCustomerAddressRecord(res.customerAddress, expectedCustomerAddress);
        
        // validate EVENT_CUSTOMER_ADDRESS_CREATED event
        expect(spy).to.have.been.called.with(expectedCustomerAddress);
    });

    it('should successfully create new customer address when address2 and googlePlacesId are undefined', async () => {
        const payload = createPayload(centsCustomer.id);
        payload.address.address2 = undefined;
        payload.googlePlacesId = undefined;

        const res = await createCustomerAddress({...payload});
        // validate customerAddress
        const expectedCustomerAddress = createCustomerAddressRecord(
            {
                ...payload.address,
                address2: null,
            },
            res.customerAddress
        );
        assertCustomerAddressRecord(res.customerAddress, expectedCustomerAddress);
    });

    it('should return existing customerAdress if address.id is passed', async () => {
        const customerAddressRecord = createCustomerAddressRecord({
            centsCustomerId: centsCustomer.id,
            address1: 'Address 1',
            address2: 'Address 2',
            city: 'City',
            firstLevelSubdivisionCode: '123',
            postalCode: '456-789',
        });

        const centsCustomerAddress = await factory.create('centsCustomerAddress', customerAddressRecord);

        const payload = {
            address: {
                id: centsCustomerAddress.id
            },
        };

        const res = await createCustomerAddress({...payload});
        expect(res.customerAddress).to.be.eql(createCustomerAddressRecord(customerAddressRecord, res.customerAddress));
    });

    it('reject with error if address is not provided', async () => {
        await assertMissingDataRejections(createCustomerAddress);
    });

    it('should reject with error if null values passed to notNull attributes', async () => {   
        const payload = createPayload(centsCustomer.id);
        await assertNotNullRestrictions(payload, createCustomerAddress);
    });
});