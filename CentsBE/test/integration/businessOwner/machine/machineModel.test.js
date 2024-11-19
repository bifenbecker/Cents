require('../../../testHelper');

const ChaiHttpRequestHelper = require('../../../support/chaiHttpRequestHelper');
const { generateToken } = require('../../../support/apiTestHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');

const getApiEndPoint = (type) => {
    return `/api/v1/employee-tab/machines/machinemodel/?type=${type}`;
};

describe('machine model test', () => {
    describe('machine model test for employee-tab', function () {
        let machineType, store, token;
        const type = 'WASHER';
        beforeEach(async () => {
            store = await factory.create('store');
            machineType = await factory.create('machineType');
            token = generateToken({ id: store.id });
        });

        it('should throw an error if token is not sent', async () => {
            const response = await ChaiHttpRequestHelper.get(getApiEndPoint(type)).set(
                'authtoken',
                '',
            );
            response.should.have.status(401);
        });

        it('should throw an error if token is not correct', async () => {
            const response = await ChaiHttpRequestHelper.get(getApiEndPoint(type)).set(
                'authtoken',
                'invalid_token',
            );
            response.should.have.status(401);
        });

        it('should throw an error if machine type does not provided', async () => {
            const response = await ChaiHttpRequestHelper.get(getApiEndPoint('')).set(
                'authtoken',
                token,
            );
            response.should.have.status(422);
            expect(response.body.error).equal('Machine Type is required.');
        });

        it('should return empty array when there is no machine model associate to', async () => {
            const response = await ChaiHttpRequestHelper.get(getApiEndPoint(type)).set(
                'authtoken',
                token,
            );
            response.should.have.status(200);
            expect(response.body.machineModels.length).to.equal(0);
        });

        it('should return associated machine model', async () => {
            const machineModel = await factory.create('machineModel', { typeId: machineType.id });
            const response = await ChaiHttpRequestHelper.get(getApiEndPoint(type)).set(
                'authtoken',
                token,
            );
            response.should.have.status(200);
            expect(response.body.machineModels[0].modelname).to.be.equal(machineModel.modelName);
            expect(response.body.machineModels[0].capacity).to.be.equal(machineModel.capacity);
            expect(response.body.machineModels[0].manufacturer).to.be.equal(
                machineModel.manufacturer,
            );
        });
    });
});
