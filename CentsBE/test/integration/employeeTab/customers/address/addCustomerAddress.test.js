require('../../../../testHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const {
    createCentsCustomerAndRelatedEntities,
} = require('../../../../support/createCustomerHelper');
const { createBaseAddressObject } = require('../../../../support/customerAddressHelper');

const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');

const getAddCustomerAddressRequestBody = (addressProperties) => ({
    address: createBaseAddressObject(addressProperties),
});

const getApiEndpoint = (centsCustomerId) =>
    '/api/v1/employee-tab/customers/:id/address/create'.replace(':id', centsCustomerId);

describe('test addCustomerAddress api', () => {
    let centsCustomer, store, storeCustomer, token;
    beforeEach(async () => {
        const entities = await createCentsCustomerAndRelatedEntities();
        store = entities.store;
        centsCustomer = entities.centsCustomer;
        storeCustomer = entities.storeCustomer;
        token = await generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPostResponseError,
        () => getApiEndpoint(centsCustomer.id),
        () => ({
            body: getAddCustomerAddressRequestBody(),
        }),
    );

    it('should succeed when request payload is correct', async () => {
        const requestBody = getAddCustomerAddressRequestBody();
        const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

        setupGetGooglePlacesIdRequestMock({
            ...requestBody.address,
            placeIdResponse: googlePlaceIdResponse,
        });

        await assertPostResponseSuccess({
            url: getApiEndpoint(centsCustomer.id),
            token,
            body: requestBody,
        });
    });

    it('should fail when request address1 is null', async () => {
        const requestBody = getAddCustomerAddressRequestBody({ address1: null });
        const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

        setupGetGooglePlacesIdRequestMock({
            ...requestBody.address,
            placeIdResponse: googlePlaceIdResponse,
        });

        await assertPostResponseError({
            url: getApiEndpoint(centsCustomer.id),
            token,
            body: requestBody,
            code: 422,
            expectedError: /"address1" must be a string/,
        });
    });
});
