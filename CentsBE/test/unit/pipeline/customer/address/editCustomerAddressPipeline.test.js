require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const { createCustomerWithAddress } = require('../../../../support/customerAddressHelper');
const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');
const editCustomerAddressPipeline = require('../../../../../pipeline/customer/address/editCustomerAddressPipeline');

const TESTED_GOOGLE_PLACE_ID = '<TESTED_GOOGLE_PLACE_ID>';
const ADDRESS = { 
    address1: 'some address1', 
    postalCode: 'some postalCode' 
};

describe('test editCustomerAddressPipeline', () => {
    let centsCustomer, centsCustomerAddress;
    beforeEach(async () => {
        const entities = await createCustomerWithAddress();
        centsCustomer = entities.centsCustomer;
        centsCustomerAddress = entities.centsCustomerAddress;
    });

    it('should call UoWs and get expected payload', async () => {
        const centsCustomerId = centsCustomer.id;
        const customerAddressId = centsCustomerAddress.id;

        setupGetGooglePlacesIdRequestMock({
            address1: ADDRESS.address1, 
            postalCode: ADDRESS.postalCode, 
            placeIdResponse: TESTED_GOOGLE_PLACE_ID
        });

        const payload = {
            centsCustomerId,
            customerAddressId,
            address: {
                ...ADDRESS
            }
        };
        
        const resPayload = await editCustomerAddressPipeline(payload);
        expect(resPayload).to.be.equal(payload);

        expect(resPayload.googlePlacesId).to.equal(TESTED_GOOGLE_PLACE_ID);
        expect(resPayload.centsCustomerId).to.equal(centsCustomerId);
        expect(resPayload.customerAddressId).to.equal(customerAddressId);
        expect(resPayload.customerAddress).to.be.not.undefined;
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(editCustomerAddressPipeline()).to.be.rejected;
        await expect(editCustomerAddressPipeline(null)).to.be.rejected;
        await expect(editCustomerAddressPipeline({})).to.be.rejected;
    });
});