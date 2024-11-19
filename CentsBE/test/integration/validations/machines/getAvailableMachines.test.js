require('../../../testHelper');
const {
    assertGetResponseError,
    assertGetResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
} = require('../../../support/httpRequestsHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');

function getApiEndPoint(storeId, type, page = 1) {
    return `/api/v1/employee-tab/machines/${storeId}/available-machines?type=${type}&page=${page}`;
}

describe('getAvailableMachines test', function () {
    let store, machineType, token;
    beforeEach(async () => {
        const business = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: business.id });
        machineType = await factory.create('machineType');
        const machineModel = await factory.create('machineModel', { typeId: machineType.id });
        const device = await factory.create('device');
        const machine = await factory.create('machine', {
            storeId: store.id,
            modelId: machineModel.id,
        });
        await factory.create('pairing', {
            deviceId: device.id,
            machineId: machine.id,
        });
        token = generateToken({ id: store.id });
    });

    itShouldCorrectlyAssertTokenPresense(assertGetResponseError, () =>
        getApiEndPoint(store.id, machineType.type),
    );

    describe('422 code test cases', function () {
        it('should throw 422 when wrong storeId provided', async () => {
            await assertGetResponseError({
                url: getApiEndPoint(0, machineType.name),
                token,
                code: 422,
                expectedError: '"storeId" must be larger than or equal to 1',
            });
        });

        it('should throw 422 when wrong type provided', async () => {
            await assertGetResponseError({
                url: getApiEndPoint(store.id, 'wrong_type'),
                token,
                code: 422,
                expectedError: '"type" must be one of [WASHER, DRYER]',
            });
        });
    });

    it('should throw 409 when non existing storeId provided', async () => {
        await assertGetResponseError({
            url: getApiEndPoint(123456, machineType.name),
            token,
            code: 409,
            expectedError: 'Invalid store id.',
        });
    });

    it('should respond successfully', async () => {
        await assertGetResponseSuccess({
            url: getApiEndPoint(store.id, machineType.name),
            token,
        });
    });
});
