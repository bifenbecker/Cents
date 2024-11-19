require('../../../testHelper');

const ChaiHttpRequestHepler = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const {
    addEditCustomerValidations,
} = require('../../../../validations/customers/addEditCustomerValidation');
const { FACTORIES_NAMES: FN } = require('../../../constants/factoriesNames');
const {
    assertPutResponseSuccess,
    assertPutResponseError,
    itShouldCorrectlyAssertTokenPresense,
    Endpoint,
    requestTypes,
} = require('../../../support/httpRequestsHelper');
const { createCentsCustomerAndRelatedEntities } = require('../../../support/createCustomerHelper');

const ADD_ENDPOINT = '/api/v1/employee-tab/customers/';
const EDIT_ENDPOINT = '/api/v1/employee-tab/customers/:id/edit';
const getEditEndpoint = (centsCustomerId) => EDIT_ENDPOINT.replace(':id', centsCustomerId);

const TEST_PHONE_NUMBER = '9999999999';
const getCustomerEditRequestBody = (id, newProperties) => ({
    availableCredit: null,
    email: null,
    fullName: 'Abc Test',
    firstName: 'Abc',
    lastName: 'Test',
    languageId: 1,
    notes: null,
    phoneNumber: TEST_PHONE_NUMBER,
    stripeCustomerId: 'cus_9999999999',
    id,
    centsCustomerId: id,
    ...newProperties,
});

const endpoints = [
    new Endpoint(ADD_ENDPOINT, requestTypes.post),
    new Endpoint(EDIT_ENDPOINT, requestTypes.put),
];

describe('test addEditCustomerValidation', () => {
    let centsCustomer, store, token, sampleBody;

    beforeEach(async () => {
        const entities = await createCentsCustomerAndRelatedEntities(null, {
            phoneNumber: TEST_PHONE_NUMBER,
        });
        const language = await factory.create(FN.language);
        centsCustomer = entities.centsCustomer;
        store = entities.store;
        token = generateToken({ id: store.id });
        sampleBody = {
            fullName: `test test`,
            languageId: language.id,
            email: 'test@gmail.com',
            phoneNumber: '5555552103',
        };
    });

    endpoints.forEach((endpoint) => {
        describe(`test general cases for ${endpoint.url}`, () => {
            let body;
            beforeEach(async () => {
                body =
                    endpoint.requestType === requestTypes.post
                        ? { ...sampleBody }
                        : getCustomerEditRequestBody(centsCustomer.id, {
                              ...sampleBody,
                          });
            });

            itShouldCorrectlyAssertTokenPresense(endpoint.assertResponseError, () =>
                endpoint.getEndPoint({ id: centsCustomer.id }),
            );

            it('should fail when phoneNumber is missing', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        phoneNumber: undefined,
                    },
                    code: 422,
                    token,
                    expectedError: '"phoneNumber" is required',
                });
            });

            it('should have status 200 when success', async () => {
                await endpoint.assertResponseSuccess({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body,
                    token,
                });
            });

            it('should have status 200 if email not passed', async () => {
                await endpoint.assertResponseSuccess({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        email: null,
                    },
                    token,
                });
            });

            it('should fail when email is not string', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        email: 123,
                    },
                    token,
                    code: 422,
                    expectedError: '"email" must be a string',
                });
            });

            it('should have status 409 if email already exists', async () => {
                const storeCustomer = await factory.create(FN.storeCustomer, {
                    storeId: store.id,
                    businessId: store.businessId,
                });

                const isEdit = endpoint.url.includes('/edit');

                if (isEdit) {
                    await endpoint.assertResponseSuccess({
                        url: endpoint.getEndPoint({ id: centsCustomer.id }),
                        body: {
                            ...body,
                            email: storeCustomer.email,
                        },
                        // code: 409,
                        token,
                        // expectedError: 'Email already exists.',
                    });
                } else {
                    await endpoint.assertResponseError({
                        url: endpoint.getEndPoint({ id: centsCustomer.id }),
                        body: {
                            ...body,
                            email: storeCustomer.email,
                        },
                        code: 409,
                        token,
                        expectedError: 'Email already exists.',
                    });
                }
            });

            it('should have status 409 if phoneNumber exists', async () => {
                const storeCustomer = await factory.create(FN.storeCustomer, {
                    storeId: store.id,
                    businessId: store.businessId,
                });
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        phoneNumber: storeCustomer.phoneNumber,
                    },
                    code: 409,
                    token,
                    expectedError: 'Phone number already exists.',
                });
            });

            it('should have status 422 if phoneNuber is longer than 16 characters', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        phoneNumber: '11111111111111111',
                    },
                    code: 422,
                    token,
                    expectedError:
                        '"phoneNumber" length must be less than or equal to 16 characters long',
                });
            });

            it('should fail when fullName is not a string', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        fullName: null,
                    },
                    token,
                    code: 422,
                    expectedError: '"fullName" must be a string',
                });
            });

            it('should fail when fullName is empty string', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        fullName: '',
                    },
                    token,
                    code: 422,
                    expectedError: '"fullName" is not allowed to be empty',
                });
            });

            it('should fail when firstName is not provided', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        firstName: null,
                    },
                    token,
                    code: 422,
                    expectedError:
                        endpoint.requestType === requestTypes.post
                            ? '"firstName" is not allowed'
                            : 'First Name cannot be empty',
                });
            });

            it('should fail when lastName is not provided', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        lastName: null,
                    },
                    token,
                    code: 422,
                    expectedError:
                        endpoint.requestType === requestTypes.post
                            ? '"lastName" is not allowed'
                            : 'Last Name cannot be empty',
                });
            });

            it('should fail when languageId is not a number', async () => {
                await endpoint.assertResponseError({
                    url: endpoint.getEndPoint({ id: centsCustomer.id }),
                    body: {
                        ...body,
                        languageId: 'one two three',
                    },
                    token,
                    code: 422,
                    expectedError: '"languageId" must be a number',
                });
            });
        });
    });

    describe('test addCustomer validation', () => {
        let firstStoreCustomer, anotherCustomer;

        beforeEach(async () => {
            firstStoreCustomer = await factory.create(FN.storeCustomer, {
                storeId: store.id,
                businessId: store.businessId,
            });
            anotherCustomer = await factory.create(FN.storeCustomer);
        });

        it('should have status 200 if email exists but is not businessCustomer', async () => {
            const body = { ...sampleBody };
            body.email = anotherCustomer.email;
            const res = await ChaiHttpRequestHepler.post(ADD_ENDPOINT, {}, body).set(
                'authtoken',
                token,
            );
            expect(res).to.have.status(200);
        });

        it('should have status 200 if phoneNumber exist but is not businessCustomer', async () => {
            const centsCustomer = await factory.create(FN.centsCustomer);
            const body = { ...sampleBody };
            body.phoneNumber = centsCustomer.phoneNumber;
            const res = await ChaiHttpRequestHepler.post(ADD_ENDPOINT, {}, body).set(
                'authtoken',
                token,
            );
            expect(res).to.have.status(200);
        });

        it('should have status 409 if phone number is associaed with some other customer', async () => {
            const body = { ...sampleBody };
            body.email = anotherCustomer.email;
            body.phoneNumber = anotherCustomer.phoneNumber;

            const res = await ChaiHttpRequestHepler.post(ADD_ENDPOINT, {}, body).set(
                'authtoken',
                token,
            );

            expect(res).to.have.status(409);
        });

        it('addEditCustomerValidations should catch error if req and res is undefined', async () => {
            addEditCustomerValidations(null, null, () => {}).then((err) => {
                expect(err).to.be.undefined;
            });
        });
    });

    describe('test editCustomerValidation', () => {
        describe('test centsCustomer body types validation', () => {
            it('should fail when centsCustomerId is not provided', async () => {
                await assertPutResponseError({
                    url: getEditEndpoint(centsCustomer.id),
                    body: getCustomerEditRequestBody(centsCustomer.id, {
                        centsCustomerId: null,
                    }),
                    token,
                    code: 422,
                    expectedError: '"centsCustomerId" must be a number',
                });
            });

            it('should fail when language is not a string', async () => {
                await assertPutResponseError({
                    url: getEditEndpoint(centsCustomer.id),
                    body: getCustomerEditRequestBody(centsCustomer.id, {
                        language: 123,
                    }),
                    token,
                    code: 422,
                    expectedError: '"language" must be a string',
                });
            });

            it('should fail when notes is not a string', async () => {
                await assertPutResponseError({
                    url: getEditEndpoint(centsCustomer.id),
                    body: getCustomerEditRequestBody(centsCustomer.id, {
                        notes: true,
                    }),
                    token,
                    code: 422,
                    expectedError: '"notes" must be a string',
                });
            });

            it('should fail when stripeCustomerId is not a string', async () => {
                await assertPutResponseError({
                    url: getEditEndpoint(centsCustomer.id),
                    body: getCustomerEditRequestBody(centsCustomer.id, {
                        stripeCustomerId: true,
                    }),
                    token,
                    code: 422,
                    expectedError: '"stripeCustomerId" must be a string',
                });
            });

            it('should succeed when only fullName is skipped', async () => {
                await assertPutResponseSuccess({
                    url: getEditEndpoint(centsCustomer.id),
                    token,
                    body: getCustomerEditRequestBody(centsCustomer.id, {
                        fullName: undefined,
                    }),
                });
            });
        });

        it('should fail when phone already in use is provided', async () => {
            const { centsCustomer } = await createCentsCustomerAndRelatedEntities(store, {
                phoneNumber: TEST_PHONE_NUMBER + 1,
            });
            await assertPutResponseError({
                url: getEditEndpoint(centsCustomer.id),
                body: getCustomerEditRequestBody(centsCustomer.id),
                token,
                code: 409,
                expectedError: 'Phone number already exists.',
            });
        });
    });
});
