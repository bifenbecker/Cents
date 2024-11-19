require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseSuccess,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');

const getAPIEndpoint = (id) => `/api/v1/business-owner/machine/${id}`;

describe('test getMachineDetails api', () => {
    let user, business, store, machine, token;

    beforeEach(async () => {
        user = await factory.create('userWithBusinessOwnerRole');
        business = await factory.create('laundromatBusiness', { userId: user.id });
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

    it('should throw an error if token is not sent', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            token: '',
            code: 401,
            expectedError: 'Please sign in to proceed.',
        });
    });

    it('should throw an error if token is not correct', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            token: '123678a',
            code: 401,
            expectedError: 'Invalid token.',
        });
    });

    it('should throw an error if user does not exist', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            token: generateToken({
                id: -1,
            }),
            code: 403,
            expectedError: 'User not found',
        });
    });

    it('should throw an error if user does not have a valid role', async () => {
        user = await factory.create('user');
        await assertGetResponseError({
            url: getAPIEndpoint(machine.id),
            token: generateToken({
                id: user.id,
            }),
            code: 403,
            expectedError: 'Unauthorized',
        });
    });

    it('should return machine details', async () => {
        const response = await assertGetResponseSuccess({
            url: getAPIEndpoint(machine.id),
            token,
        });

        const { result } = JSON.parse(response.text);
        expect(result).to.include({
            id: machine.id,
            name: machine.name,
            serialNumber: machine.serialNumber,
            turnTimeInMinutes: machine.turnTimeInMinutes,
        });
    });

    it('should throw an error if machine was not found', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(99999),
            token,
            code: 500,
            expectedError: 'Machine not found',
        });
    });
});
