require('../../../testHelper');

const {
    assertPostResponseError,
    assertPostResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/machines/validate-name/`;
}

describe('validateMachineName route test', () => {
    describe('validateMachineName route test for employee tab', function () {
        let machineType, store, machineModel, token;
        beforeEach(async () => {
            store = await factory.create('store');
            machineType = await factory.create('machineType');
            machineModel = await factory.create('machineModel', { typeId: machineType.id });
            token = generateToken({ id: store.id });
        });

        itShouldCorrectlyAssertTokenPresense(assertPostResponseError, () => getApiEndPoint());

        it('should respond successfully', async () => {
            const body = {
                name: 'test_name',
                modelId: machineModel.id,
                storeId: store.id,
            };
            const response = await assertPostResponseSuccess({
                url: getApiEndPoint(),
                body,
                token,
            });
            expect(response.body.success).to.equal(true);
        });

        it('should throw 500 when wrong model id provided', async () => {
            const body = {
                name: 'test_name',
                modelId: 12345,
                storeId: store.id,
            };
            await assertPostResponseError({
                url: getApiEndPoint(),
                body,
                token,
                code: 500,
                expectedError: 'invalid model id',
            });
        });

        it('should throw 409 when wrong store id provided', async () => {
            const body = {
                name: 'test_name',
                modelId: machineModel.id,
                storeId: 12345,
            };
            await assertPostResponseError({
                url: getApiEndPoint(),
                body,
                token,
                code: 409,
                expectedError: 'Invalid store id.',
            });
        });
    });
});
