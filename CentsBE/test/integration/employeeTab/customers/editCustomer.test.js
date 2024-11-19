require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const {
    assertPutResponseSuccess,
    assertPutResponseError,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const { createCentsCustomerAndRelatedEntities } = require('../../../support/createCustomerHelper');

const getCustomerEditRequestBody = (id, newProperties) => ({
    email: 'some@email.com',
    fullName: 'Abc Test',
    firstName: 'Abc',
    lastName: 'Test',
    languageId: 1,
    notes: '',
    phoneNumber: '9999999999',
    id,
    centsCustomerId: id,
    ...newProperties,
});

const getApiEndpoint = (centsCustomerId) =>
    '/api/v1/employee-tab/customers/:id/edit'.replace(':id', centsCustomerId);

describe('test editCustomer api', () => {
    let centsCustomer, store, token;
    beforeEach(async () => {
        const entities = await createCentsCustomerAndRelatedEntities();
        store = entities.store;
        centsCustomer = entities.centsCustomer;
        token = await generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(
        assertPutResponseError,
        () => getApiEndpoint(centsCustomer.id),
        () => ({
            body: getCustomerEditRequestBody(centsCustomer.id),
        }),
    );

    it('should fail if body does not contain reqired data', async () => {
        const body = {};
        await assertPutResponseError({
            url: getApiEndpoint(centsCustomer.id),
            token,
            body,
            code: 422,
            expectedError: /is required$/,
        });
    });

    // Other negative cases are coded in
    //     test/validations/customers/addEditCustomerValidation.test.js

    it('should succeed and return expected details when request data is correct', async () => {
        const body = getCustomerEditRequestBody(centsCustomer.id);
        const res = await assertPutResponseSuccess({
            url: getApiEndpoint(centsCustomer.id),
            token,
            body,
        });

        expect(res.body.details).to.include({
            ...body,
            language: 'english',
        });
    });
});
