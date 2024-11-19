require('../../testHelper');

const ChaiHttpRequestHepler = require('../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../support/apiTestHelper');
const factory = require('../../factories');
const { expect } = require('../../support/chaiHelper');

const getEndpoint = (id) => `/api/v1/employee-tab/customers/${id}/credits`;

async function checkForResponseError({ id, token, code, expectedError }) {
    // act
    const response = await ChaiHttpRequestHepler.get(getEndpoint(id)).set('authtoken', token);

    // assert
    expect(response).to.have.status(code);
    expect(response.body.error).to.equal(expectedError);
}

describe('test createTierValidation ', () => {
    let user, business;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
    });

    it('should fail when token is not provided', async () => {
        await checkForResponseError({
            user,
            code: 401,
            token: '',
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should fail when store does not exist', async () => {
        const token = generateToken({
            id: user.id,
            role: 1,
        });

        await checkForResponseError({
            id: user.id,
            code: 403,
            token: token,
            expectedError: 'Store not found',
        });
    });

    it('should fail when token id is not valid integer', async () => {
        business = await factory.create('laundromatBusiness');
        const store = await factory.create('store', { businessId: business.id });

        const token = generateToken({
            id: store.id,
        });

        await checkForResponseError({
            id: 'fail',
            code: 422,
            token: token,
            expectedError: 'id must be a positive integer.',
        });
    });

    it('should fail when token id is equal zero', async () => {
        business = await factory.create('laundromatBusiness');
        const store = await factory.create('store', { businessId: business.id });

        const token = generateToken({
            id: store.id,
        });

        await checkForResponseError({
            id: 0,
            code: 422,
            token: token,
            expectedError: 'id must be greater than equal to 1',
        });
    });

    it('should fail when customer does not exist', async () => {
        business = await factory.create('laundromatBusiness');
        const store = await factory.create('store', { businessId: business.id });

        const token = generateToken({
            id: store.id,
        });

        await checkForResponseError({
            id: 1,
            code: 404,
            token: token,
            expectedError: 'Customer not found.',
        });
    });
});
