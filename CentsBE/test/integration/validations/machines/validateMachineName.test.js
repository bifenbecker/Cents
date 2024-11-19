require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/machines/validate-name/`;
}

describe('validateMachineName validator test', () => {
    let store, machineType, machineModel, token;
    beforeEach(async () => {
        store = await factory.create('store');
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
        token = generateToken({ id: store.id });
    });

    it('should throw an error if token is not sent', async () => {
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint()).set('authtoken', '');
        expect(response.status).to.equal(401);
    });

    it('should throw an error if token is not correct', async () => {
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint()).set(
            'authtoken',
            'invalid_token',
        );
        expect(response.status).to.equal(401);
    });

    it('should throw 422 when empty body provided', async () => {
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, {}).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(422);
    });

    it('should throw 409 when wrong storeId provided', async () => {
        const response = await ChaiHttpRequestHelper.post(
            getApiEndPoint(),
            {},
            {
                storeId: 12345,
                name: 'test_name',
                modelId: 123,
            },
        ).set('authtoken', token);
        expect(response.status).to.equal(409);
    });

    it('should respond successfully', async () => {
        const body = {
            name: 'test_name',
            modelId: machineModel.id,
            storeId: store.id,
        };
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });
});
