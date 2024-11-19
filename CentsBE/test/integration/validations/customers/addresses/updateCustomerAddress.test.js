require('../../../../testHelper');
const {
    assertPutResponseError,
    assertPutResponseSuccess,
    assertPatchResponseError,
    assertPatchResponseSuccess,
} = require('../../../../support/httpRequestsHelper');
const { generateToken } = require('../../../../support/apiTestHelper');
const {
    createCustomerWithAddress,
    createBaseAddressObject,
} = require('../../../../support/customerAddressHelper');
const { setupGetGooglePlacesIdRequestMock } = require('../../../../support/mockedHttpRequests');
const {
    createMiddlewareMockedArgs,
} = require('../../../../support/mockers/createMiddlewareMockedArgs');
const {
    validateForRequestWithParams,
    validateForRequestBody,
} = require('../../../../../validations/customers/addresses/updateCustomerAddress');
const { expect } = require('../../../../support/chaiHelper');

const googlePlaceIdResponse = '<TESTED_GOOGLE_PLACE_ID>';

const employeeTabEndpoint = {
    name: 'employee-tab',
    getEndpoint: (centsCustomerId) =>
        `/api/v1/employee-tab/customers/${centsCustomerId}/address/edit`,
    getBody: (body) => body,
    assertError: assertPutResponseError,
    assertSuccess: assertPutResponseSuccess,
    validateFunction: validateForRequestWithParams,
};

const liveLinkEndpoint = {
    name: 'live-status',
    getEndpoint: () => '/api/v1/live-status/customer/address/update',
    getBody: (body, centsCustomerId, customerAddressId) => ({
        ...body,
        centsCustomerId,
        customerAddressId,
    }),
    assertError: assertPatchResponseError,
    assertSuccess: assertPatchResponseSuccess,
    validateFunction: validateForRequestBody,
};

const endpoints = [employeeTabEndpoint, liveLinkEndpoint];

const getEditCustomerAddressRequestBody = (addressProperties) => ({
    address: createBaseAddressObject(addressProperties),
});

const prepareRequestBody = (addressProperties) => {
    const body = getEditCustomerAddressRequestBody(addressProperties);

    setupGetGooglePlacesIdRequestMock({
        ...body.address,
        placeIdResponse: googlePlaceIdResponse,
    });

    return body;
};

describe('test updateCustomerAddress validation', () => {
    let centsCustomerId, customerAddressId, token;

    beforeEach(async () => {
        const entities = await createCustomerWithAddress();
        const store = entities.store;
        centsCustomerId = entities.centsCustomer.id;
        customerAddressId = entities.centsCustomerAddress.id;
        token = await generateToken({ id: store.id });
    });

    describe('general tests', () => {
        endpoints.forEach((endpoint) => {
            describe(`${endpoint.name} endpoint`, () => {
                it('should pass validation', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });

                    await endpoint.assertSuccess({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                    });
                });

                it('should fail when centsCustomerId is not provided', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(),
                        token,
                        body: endpoint.getBody(body, undefined, customerAddressId),
                        code: 422,
                    });
                });

                it('should fail when centsCustomerId is not a number', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });

                    const centsCustomerId = 'id1';

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"centsCustomerId" must be a number/,
                    });
                });

                it('should fail when address is not an object', async () => {
                    const body = {
                        address: 'New York, Sample street, 10001',
                    };

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"address" must be an object/,
                    });
                });

                it('should fail when address.address1 is not provided', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });
                    delete body.address.address1;

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"address1" is required/,
                    });
                });

                it('should fail when address.address1 is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        address1: {
                            city: 'NY',
                            street: 'Sample street',
                        },
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"address1" must be a string/,
                    });
                });

                it('should fail when address.address2 is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        address2: {
                            city: 'NY',
                            street: 'Sample street',
                        },
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"address2" must be a string/,
                    });
                });

                it('should fail when address.centsCustomerId is not a number', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        centsCustomerId: 'id1',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"centsCustomerId" must be a number/,
                    });
                });

                it('should fail when address.city is not provided', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });
                    delete body.address.city;

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"city" is required/,
                    });
                });

                it('should fail when address.city is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        city: {
                            name: 'New York',
                            district: 'Manhattan',
                        },
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"city" must be a string/,
                    });
                });

                it('should fail when address.countryCode is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        countryCode: 1800,
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"countryCode" must be a string/,
                    });
                });

                it('should fail when address.createdAt is not a date', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        createdAt: 'September 10th, 2021',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError:
                            /"createdAt" must be a number of milliseconds or valid date string/,
                    });
                });

                it('should fail when address.firstLevelSubdivisionCode is not provided', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });
                    delete body.address.firstLevelSubdivisionCode;

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"firstLevelSubdivisionCode" is required/,
                    });
                });

                it('should fail when address.firstLevelSubdivisionCode is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        firstLevelSubdivisionCode: {
                            zip: '1001',
                        },
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"firstLevelSubdivisionCode" must be a string/,
                    });
                });

                it('should fail when address.googlePlacesId is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        googlePlacesId: 1,
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"googlePlacesId" must be a string/,
                    });
                });

                it('should fail when address.id is not a number', async () => {
                    const body = prepareRequestBody({
                        id: 'id1',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"id" must be a number/,
                    });
                });

                it('should fail when address.instructions is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        instructions: {
                            note: 'Drive through the street to the red house',
                        },
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"instructions" must be a string/,
                    });
                });

                it('should fail when address.lat is not a number', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        lat: 'lat: 40.73',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"lat" must be a number/,
                    });
                });

                it('should fail when address.leaveAtDoor is not a boolean', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        leaveAtDoor: 'yes',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"leaveAtDoor" must be a boolean/,
                    });
                });

                it('should fail when address.lng is not a number', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        lng: 'lat: -73.93',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"lng" must be a number/,
                    });
                });

                it('should fail when address.postalCode is not provided', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                    });
                    delete body.address.postalCode;

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"postalCode" is required/,
                    });
                });

                it('should fail when address.postalCode is not a string', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        postalCode: 10001,
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError: /"postalCode" must be a string/,
                    });
                });

                it('should fail when address.updatedAt is not a date', async () => {
                    const body = prepareRequestBody({
                        id: customerAddressId,
                        updatedAt: 'September 10th, 2021',
                    });

                    await endpoint.assertError({
                        url: endpoint.getEndpoint(centsCustomerId),
                        token,
                        body: endpoint.getBody(body, centsCustomerId, customerAddressId),
                        code: 422,
                        expectedError:
                            /"updatedAt" must be a number of milliseconds or valid date string/,
                    });
                });

                it('should call next(error) if data is not correct', async () => {
                    const { mockedRes, mockedNext } = createMiddlewareMockedArgs();

                    endpoint.validateFunction(null, mockedRes, mockedNext);

                    expect(mockedNext.called, 'should call next(error)').to.be.true;
                    expect(mockedNext.getCall(0).args[0].message).to.not.be.empty;
                });
            });
        });
    });

    describe('specific live-status tests', () => {
        it('should fail when address is not provided', async () => {
            await liveLinkEndpoint.assertError({
                url: liveLinkEndpoint.getEndpoint(centsCustomerId),
                token,
                body: liveLinkEndpoint.getBody({}, centsCustomerId, customerAddressId),
                code: 422,
                expectedError: /"address" is required/,
            });
        });

        it('should fail when customerAddressId is not provided', async () => {
            const body = prepareRequestBody({
                id: customerAddressId,
            });

            await liveLinkEndpoint.assertError({
                url: liveLinkEndpoint.getEndpoint(centsCustomerId),
                token,
                body: liveLinkEndpoint.getBody(body, centsCustomerId),
                code: 422,
                expectedError: /"customerAddressId" is required/,
            });
        });

        it('should fail when customerAddressId is not a number', async () => {
            const body = prepareRequestBody({
                id: customerAddressId,
            });

            await liveLinkEndpoint.assertError({
                url: liveLinkEndpoint.getEndpoint(centsCustomerId),
                token,
                body: liveLinkEndpoint.getBody(body, centsCustomerId, 'id123'),
                code: 422,
                expectedError: /"customerAddressId" must be a number/,
            });
        });
    });

    describe('specific employee-tab tests', () => {
        it('should fail when address is not provided', async () => {
            await employeeTabEndpoint.assertError({
                url: employeeTabEndpoint.getEndpoint(centsCustomerId),
                token,
                body: employeeTabEndpoint.getBody({}, centsCustomerId, customerAddressId),
                code: 500,
            });
        });
    });
});
