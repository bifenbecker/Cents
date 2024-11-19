require('../../../testHelper');
const {
    assertGetResponseSuccess,
    itShouldCorrectlyAssertTokenPresense,
    assertGetResponseError,
} = require('../../../support/httpRequestsHelper');
const { expect } = require('../../../support/chaiHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');

function getApiEndPoint(storeId, type, page = 1) {
    return `/api/v1/employee-tab/machines/${storeId}/available-machines?type=${type}&page=${page}`;
}

describe('machineList route test', function () {
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

    it('should respond successfully', async () => {
        const res = await assertGetResponseSuccess({
            url: getApiEndPoint(store.id, machineType.name),
            token,
        });
        expect(res.body.success).equal(true);
    });

    it('should throw 500 when wrong page provided', async () => {
        await assertGetResponseError({
            url: getApiEndPoint(store.id, machineType.name, 0),
            token,
            code: 500,
        });
    });
});
