require('../../../testHelper');
const factory = require('../../../factories');
const { generateToken } = require('../../../support/apiTestHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
} = require('../../../support/httpRequestsHelper');

const getAPIEndpoint = (id) => `/api/v1/employee-tab/machines/${id}`;

describe('test getMachineDetailsValidation', () => {
    let store, machine, token;

    beforeEach(async () => {
        store = await factory.create('store');
        machine = await factory.create('machine', {
            storeId: store.id,
        });
        token = generateToken({
            id: store.id,
        });
    });

    it('should fail when machine id is not a number', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint('onetwothree'),
            token,
            code: 422,
            expectedError: 'id must be a positive integer.',
        });
    });

    it('should fail when machine id is not an integer', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(1.5),
            token,
            code: 422,
            expectedError: 'id must be a positive integer.',
        });
    });

    it('should fail when machine id is not a positive integer', async () => {
        await assertGetResponseError({
            url: getAPIEndpoint(-machine.id),
            token,
            code: 422,
            expectedError: 'id must be a positive integer.',
        });
    });

    it('should pass when machine id is valid', async () => {
        await assertGetResponseSuccess({
            url: getAPIEndpoint(machine.id),
            token,
        });
    });
});
