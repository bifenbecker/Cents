require('../../../../testHelper');
const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');
const { expect } = require('../../../../support/chaiHelper');
const getGooglePlacesId = require('../../../../../uow/customer/address/getGooglePlacesAddressUow');

const address = {
    address1: 'Some Test Address',
    postalCode: '12345-67890'
};

describe('test getGooglePlacesAddressUow', () => {
    it('should set actual googlePlacesId in payload', async () => {
        const placeIdResponse = '123456789';
        const expectedPayload = {
            address,
            googlePlacesId: placeIdResponse
        };

        
        setupGetGooglePlacesIdRequestMock({
            ...address,
            placeIdResponse
        });

        const res = await getGooglePlacesId({address});
        expect(res).to.deep.equal(expectedPayload);
    });

    it('should throw ann error if request fails', async () => {   
        setupGetGooglePlacesIdRequestMock({...address}, 404, 'Not Found');
        await expect(getGooglePlacesId({address})).to.be.rejectedWith('Request failed with status code 404');
    });
});
