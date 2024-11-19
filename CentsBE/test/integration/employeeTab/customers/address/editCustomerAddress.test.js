require('../../../../testHelper');
const {
    assertPutResponseSuccess,
    assertPutResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const {
    createCustomerWithAddress,
    createBaseAddressObject,
} = require('../../../../support/customerAddressHelper');
const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');

const getEditCustomerAddressRequestBody = (centsCustomerId, addressProperties) => ({
    centsCustomerId,
    address: createBaseAddressObject(addressProperties),
});

const getApiEndpoint = (centsCustomerId) =>
    '/api/v1/employee-tab/customers/:id/address/edit'.replace(':id', centsCustomerId);

describe('test editCustomerAddress api', () => {
    let centsCustomer, centsCustomerAddress, store, storeCustomer, token;
    beforeEach(async () => {
        const entities = await createCustomerWithAddress();
        store = entities.store;
        centsCustomer = entities.centsCustomer;
        storeCustomer = entities.storeCustomer;
        centsCustomerAddress = entities.centsCustomerAddress;
        token = await generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPutResponseError,
        () => getApiEndpoint(centsCustomer.id),
        () => ({
            body: getEditCustomerAddressRequestBody(),
        }),
    );

    it('should succeed when request payload is correct', async () => {
        const body = getEditCustomerAddressRequestBody(centsCustomer.id, {
            id: centsCustomerAddress.id,
        });
        const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

        setupGetGooglePlacesIdRequestMock({
            ...body.address,
            placeIdResponse: googlePlaceIdResponse,
        });

        await assertPutResponseSuccess({
            url: getApiEndpoint(centsCustomer.id),
            token,
            body,
        });
    });

    it('should fail when request address1 is null', async () => {
        const requestBody = getEditCustomerAddressRequestBody(centsCustomer.id, {
            id: centsCustomerAddress.id,
            address1: null,
        });
        const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

        setupGetGooglePlacesIdRequestMock({
            ...requestBody.address,
            placeIdResponse: googlePlaceIdResponse,
        });

        await assertPutResponseError({
            url: getApiEndpoint(centsCustomer.id),
            token,
            body: requestBody,
            code: 422,
            expectedError: /"address1" must be a string/,
        });
    });
});
