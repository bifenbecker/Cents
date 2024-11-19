require('../../../../testHelper');
const { chai, expect } = require('../../../../support/chaiHelper');
const { 
    createCustomerWithAddress,
    createPayload,
    createBaseAddressObject,
    createCustomerAddressRecord,
    assertCustomerAddressRecord,
    assertMissingDataRejections,
    assertNotNullRestrictions,
} = require('../../../../support/customerAddressHelper');

const eventEmitter = require('../../../../../config/eventEmitter');
const editCustomerAddress = require('../../../../../uow/customer/address/editCustomerAddressUow');

const getPayload = (centsCustomerId, customerAddressId, data) => createPayload(centsCustomerId, {
    customerAddressId,
    address: {
        address1: '',
        address2: 'Address 2',
        city: '',
        firstLevelSubdivisionCode: '',
        postalCode: '',
    },
    ...data
});

describe('test editCustomerAddressUow', () => {
    let centsCustomer, centsCustomerAddress;
    beforeEach(async () => {
        const entities = await createCustomerWithAddress();
        centsCustomer = entities.centsCustomer;
        centsCustomerAddress = entities.centsCustomerAddress;
    });

    it('should succesfully update customer address and return payload with reference to it', async () => {   
        const payload = getPayload(centsCustomer.id, centsCustomerAddress.id);     
        const res = await editCustomerAddress(payload);

        const expectedPayload = {
            ...payload,
            customerAddress: createCustomerAddressRecord(
                {
                    ...payload.address, 
                    googlePlacesId: payload.googlePlacesId,
                    centsCustomerId: centsCustomer.id,
                },    
                res.customerAddress
            )
        };
        expect(res).to.be.deep.equal(expectedPayload);
        assertCustomerAddressRecord(res.customerAddress, expectedPayload.customerAddress);
    });

    it('should dispatch customerAddressCreated event with customerAddress', async () => {
        const spy = chai.spy(() => {});
        eventEmitter.once('customerAddressCreated', spy);
        
        const res = await editCustomerAddress(getPayload(centsCustomer.id, centsCustomerAddress.id));

        expect(spy).to.have.been.called.with(res.customerAddress);
    });

    it('should successfully update the customer address when address2 and googlePlacesId are undefined', async () => {
        const payload = getPayload(centsCustomer.id, centsCustomerAddress.id, {
            address: createBaseAddressObject({address2: undefined}),
            googlePlacesId: undefined
        });     
        const res = await editCustomerAddress(payload);

        const expectedPayload = {
            ...payload,
            customerAddress: createCustomerAddressRecord(
                {
                    ...payload.address, 
                    address2: null,
                    googlePlacesId: null,
                },    
                res.customerAddress
            )
        };
        expect(res).to.be.deep.equal(expectedPayload);
        assertCustomerAddressRecord(res.customerAddress, expectedPayload.customerAddress);
    });


    it('should reject with error if payload or nested address is null or undefined', async () => {
        await expect(editCustomerAddress(getPayload(undefined, undefined))).to.be.rejected;
    });

    it('should reject with error if payload or nested address is null or undefined', async () => {   
        await assertMissingDataRejections(editCustomerAddress);
    });

    it('should reject with error if non-existing centsCustomerId is passed', async () => {
        const payload = getPayload(100500, centsCustomerAddress.id); 
        await expect(editCustomerAddress(payload)).to.be.rejected;
    })

    it('should reject with error if null values passed to notNull attributes', async () => {   
        const payload = getPayload(centsCustomer.id, centsCustomerAddress.id); 

        const payloadWithNullCentsCustomerId = {...payload, centsCustomerId: null};
        await expect(editCustomerAddress(payloadWithNullCentsCustomerId)).to.be.rejected;

        await assertNotNullRestrictions(payload, editCustomerAddress);
    });
});