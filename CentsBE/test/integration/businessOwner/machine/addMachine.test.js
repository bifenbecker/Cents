require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/machines`;
}

describe('addMachine route test', () => {
    describe('addMachine route test for employee tab', () => {
        let machineModel, machineType, store, laundromatBusiness, token;
        beforeEach(async () => {
            machineType = await factory.create('machineType');
            machineModel = await factory.create('machineModel', { typeId: machineType.id });
            laundromatBusiness = await factory.create('laundromatBusiness');
            store = await factory.create('store', { businessId: laundromatBusiness.id });
            token = generateToken({ id: store.id });
        });

        it('should throw an error if token is not sent', async () => {
            const response = await ChaiHttpRequestHelper.post(getApiEndPoint()).set(
                'authtoken',
                '',
            );
            expect(response.status).to.equal(401);
        });

        it('should throw an error if token is not correct', async () => {
            const response = await ChaiHttpRequestHelper.post(getApiEndPoint()).set(
                'authtoken',
                'invalid_token',
            );
            expect(response.status).to.equal(401);
        });

        it('should response with 200', async () => {
            const body = {
                name: 'name',
                storeId: store.id,
                pricePerTurnInCents: 2,
                modelId: machineModel.id,
            };
            const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
                'authtoken',
                token,
            );
            expect(response.status).to.equal(200);
            expect(response.body.success).to.equal(true);
        });
    });
});
