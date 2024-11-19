require('../../../../testHelper');
const factory = require('../../../../factories');
const { generateToken } = require('../../../../support/apiTestHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../../support/httpRequestsHelper');

const getAPIEndpoint = (id) => `/api/v1/business-owner/machine/${id}/turns`;

describe('test getTurnList validation', () => {
    let machine, token;

    beforeEach(async () => {
        const user = await factory.create('userWithBusinessOwnerRole'),
            business = await factory.create('laundromatBusiness', { userId: user.id }),
            store = await factory.create('store', {
                businessId: business.id,
            });

        machine = await factory.create('machine', {
            storeId: store.id,
        });
        token = generateToken({
            id: user.id,
        });
    });

    it('should fail when machine id is not a number', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint('id23'),
            params: { page: 1 },
            token,
            code: 422,
            expectedError: '"machineId" must be a number',
        });
    });

    it('should fail when machine id is not an integer', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(7.89),
            params: { page: 1 },
            token,
            code: 422,
            expectedError: '"machineId" must be an integer',
        });
    });

    it('should fail when machine id is less than 1', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(0),
            params: { page: 1 },
            token,
            code: 422,
            expectedError: '"machineId" must be larger than or equal to 1',
        });
    });

    it('should fail when page is not provided', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            token,
            code: 422,
            expectedError: '"page" is required',
        });
    });

    it('should fail when page is not a number', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 'p1' },
            token,
            code: 422,
            expectedError: '"page" must be a number',
        });
    });

    it('should fail when page is not an integer', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 4.3 },
            token,
            code: 422,
            expectedError: '"page" must be an integer',
        });
    });

    it('should fail when page is less than 1', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            params: { page: 0 },
            token,
            code: 422,
            expectedError: '"page" must be larger than or equal to 1',
        });
    });

    it('should pass validation', async () => {
        await assertGetResponseSuccess({
            url: getAPIEndpoint(machine.id),
            params: { page: 1 },
            token,
        });
    });
});
