require('../../../../testHelper');
const {
    createCentsCustomerAndRelatedEntities,
} = require('../../../../support/createCustomerHelper');
const {
    assertPostResponseError,
    assertPostResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const { createBaseAddressObject } = require('../../../../support/customerAddressHelper');
const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');
const factory = require('../../../../factories');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');

const employeeTabEndpoint = {
    getEndpoint: (centsCustomerId) =>
        `/api/v1/employee-tab/customers/${centsCustomerId}/address/create`,
    getBody: (body) => body,
};
const liveLinkEndpoint = {
    getEndpoint: () => '/api/v1/live-status/customer/address/create',
    getBody: (body, centsCustomerId) => ({ ...body, centsCustomerId }),
};

const endpoints = [employeeTabEndpoint, liveLinkEndpoint];

const getAddCustomerAddressRequestBody = (addressProperties) => ({
    address: createBaseAddressObject(addressProperties),
});

describe('test createCustomerAddress validation', () => {
    let centsCustomer, token;

    beforeEach(async () => {
        const entities = await createCentsCustomerAndRelatedEntities();
        const store = entities.store;
        centsCustomer = entities.centsCustomer;
        token = await generateToken({ id: store.id });
    });

    endpoints.forEach((endpoint) => {
        it('should pass validation', async () => {
            const requestBody = getAddCustomerAddressRequestBody();
            const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

            setupGetGooglePlacesIdRequestMock({
                ...requestBody.address,
                placeIdResponse: googlePlaceIdResponse,
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseSuccess({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
            });
        });

        it('should fail when centsCustomer id is not provided', async () => {
            const requestBody = getAddCustomerAddressRequestBody();

            await assertPostResponseError({
                url: endpoint.getEndpoint(),
                token,
                body: endpoint.getBody(requestBody),
                code: 422,
            });
        });

        it('should fail when centsCustomer id is not a number', async () => {
            const requestBody = getAddCustomerAddressRequestBody();

            const centsCustomerId = 'id1';

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /centsCustomerId" must be a number/,
            });
        });

        it('should fail when address is not provided', async () => {
            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody({}, centsCustomerId),
                code: 422,
                expectedError: /address" is required]/,
            });
        });

        it('should fail when address is not an object', async () => {
            const centsCustomerId = centsCustomer.id;
            const address = 'NY, Sample street 1800';

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody({ address }, centsCustomerId),
                code: 422,
                expectedError: /"address" must be an object/,
            });
        });

        it('should fail when address1 is not provided', async () => {
            const requestBody = getAddCustomerAddressRequestBody();
            delete requestBody.address.address1;

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"address1" is required/,
            });
        });

        it('should fail when address1 is not a string', async () => {
            const requestBody = getAddCustomerAddressRequestBody({
                address1: {
                    city: 'NY',
                    street: 'Sample street',
                },
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"address1" must be a string/,
            });
        });

        it('should fail when address2 is not a string', async () => {
            const requestBody = getAddCustomerAddressRequestBody({
                address2: {
                    city: 'NY',
                    street: 'Sample street',
                },
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"address2" must be a string/,
            });
        });

        it('should pass validation when address2 is an empty string', async () => {
            const requestBody = getAddCustomerAddressRequestBody({
                address2: '',
            });
            const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

            setupGetGooglePlacesIdRequestMock({
                ...requestBody.address,
                placeIdResponse: googlePlaceIdResponse,
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseSuccess({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
            });
        });

        it('should fail when city is not provided', async () => {
            const requestBody = getAddCustomerAddressRequestBody();
            delete requestBody.address.city;

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"city" is required/,
            });
        });

        it('should fail when city is not a string', async () => {
            const requestBody = getAddCustomerAddressRequestBody({
                city: {
                    name: 'NY',
                },
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"city" must be a string/,
            });
        });

        it('should fail when firstLevelSubdivisionCode is not provided', async () => {
            const requestBody = getAddCustomerAddressRequestBody();
            delete requestBody.address.firstLevelSubdivisionCode;

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"firstLevelSubdivisionCode" is required/,
            });
        });

        it('should fail when firstLevelSubdivisionCode is not a string', async () => {
            const requestBody = getAddCustomerAddressRequestBody({
                firstLevelSubdivisionCode: {
                    zip: '10001',
                },
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"firstLevelSubdivisionCode" must be a string/,
            });
        });

        it('should fail when postalCode is not provided', async () => {
            const requestBody = getAddCustomerAddressRequestBody();
            delete requestBody.address.postalCode;

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"postalCode" is required/,
            });
        });

        it('should fail when postalCode is not a string', async () => {
            const requestBody = getAddCustomerAddressRequestBody({
                postalCode: {
                    zip: '10002',
                },
            });

            const centsCustomerId = centsCustomer.id;

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError: /"postalCode" must be a string/,
            });
        });

        it('should fail when adding existing address', async () => {
            const requestBody = getAddCustomerAddressRequestBody();

            const centsCustomerId = centsCustomer.id;

            // create address duplicate
            await factory.create(FACTORIES_NAMES.centsCustomerAddress, {
                ...requestBody.address,
                centsCustomerId,
            });

            await assertPostResponseError({
                url: endpoint.getEndpoint(centsCustomerId),
                token,
                body: endpoint.getBody(requestBody, centsCustomerId),
                code: 422,
                expectedError:
                    "We've already got this address on file for you. If you want to change the address, please go back and edit the address instead.",
            });
        });
    });
});
