require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');
const factory = require('../../../../factories');
const createCustomerAddressPipeline = require('../../../../../pipeline/customer/address/createCustomerAddressPipeline');

const TESTED_GOOGLE_PLACE_ID = '<TESTED_GOOGLE_PLACE_ID>';
const ADDRESS = { 
    address1: 'some address1', 
    postalCode: 'some postalCode',
    city: '',
    firstLevelSubdivisionCode: '',
};

describe('test createCustomerAddressPipeline', () => {
    let centsCustomer;

    beforeEach(async () => {
        centsCustomer = await factory.create('centsCustomer', { firstName: 'John' });
    });

    it('should call UoWs and get expected payload', async () => {
        const centsCustomerId = centsCustomer.id;

        setupGetGooglePlacesIdRequestMock({
            address1: ADDRESS.address1, 
            postalCode: ADDRESS.postalCode, 
            placeIdResponse: TESTED_GOOGLE_PLACE_ID
        });

        const payload = {
            centsCustomerId,
            address: {
                ...ADDRESS
            }
        };
        
        await createCustomerAddressPipeline(payload);

        expect(payload.googlePlacesId).to.equal(TESTED_GOOGLE_PLACE_ID);
        expect(payload.centsCustomerId).to.equal(centsCustomerId);
        expect(payload.customerAddress).to.be.not.undefined;
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(createCustomerAddressPipeline()).to.be.rejected;
        await expect(createCustomerAddressPipeline(null)).to.be.rejected;
        await expect(createCustomerAddressPipeline({})).to.be.rejected;
    });
});