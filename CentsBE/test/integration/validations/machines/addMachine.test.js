require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

function getApiEndPoint() {
    return `/api/v1/employee-tab/machines/`;
}

describe('addMachine validator test', () => {
    let machineModelWasher, machineModelDryer, store, token;
    beforeEach(async () => {
        const machineTypeWasher = await factory.create(FACTORIES_NAMES.machineTypeWasher);
        const machineTypeDryer = await factory.create(FACTORIES_NAMES.machineTypeDryer);
        machineModelWasher = await factory.create('machineModel', {
            typeId: machineTypeWasher.id,
        });

        machineModelDryer = await factory.create('machineModel', {
            typeId: machineTypeDryer.id,
        });
        const laundromatBusiness = await factory.create('laundromatBusiness');
        store = await factory.create('store', { businessId: laundromatBusiness.id });
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

    it('should throw 422 if model id not provided', async () => {
        const body = {
            name: 'test.name',
            storeId: store.id,
        };
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(422);
    });

    it('should throw 409 if wrong store id provided', async () => {
        const body = {
            name: 'name',
            storeId: 12345,
            pricePerTurnInCents: 2,
            modelId: machineModelWasher.id,
        };
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(409);
    });

    it('should throw 409 if existed serial number provided', async () => {
        const machine = await factory.create('machine');

        const body = {
            name: 'name',
            storeId: store.id,
            pricePerTurnInCents: 2,
            modelId: machineModelWasher.id,
            serialNumber: machine.serialNumber,
        };

        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(409);
        expect(response.body.error).to.equal('Barcode already Exists');
    });

    it('should throw 409 if existed serial number provided', async () => {
        const body = {
            name: 'name',
            storeId: store.id,
            pricePerTurnInCents: 2,
            modelId: machineModelWasher.id,
            serialNumber: '123456789_987654321_123456789',
        };

        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(409);
        expect(response.body.error).to.equal('Barcode length exceeded.');
    });

    it('should response successfully for washer machine', async () => {
        const body = {
            name: 'name',
            storeId: store.id,
            pricePerTurnInCents: 2,
            modelId: machineModelWasher.id,
        };
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });

    it('should response successfully for dryer machine', async () => {
        const body = {
            name: 'name',
            storeId: store.id,
            turnTimeInMinutes: 25,
            modelId: machineModelDryer.id,
        };
        const response = await ChaiHttpRequestHelper.post(getApiEndPoint(), {}, body).set(
            'authtoken',
            token,
        );
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });
});
