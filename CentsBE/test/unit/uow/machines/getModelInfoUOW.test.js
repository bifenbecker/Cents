require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const getModelInfoUOW = require('../../../../uow/machines/getModelInfoUOW');

describe('getModelInfoUOW test', () => {
    let machineModel, machineType;

    beforeEach(async () => {
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
    });

    it('should throw error if wrong model id provided', async () => {
        const payload = {
            modelId: 12345,
        };
        await expect(getModelInfoUOW(payload)).to.be.rejectedWith('invalid model id');
    });

    it('should just return payload unchanged if passed payload with incorrect data', async () => {
        const res = await getModelInfoUOW({ test: 'test' });
        await expect(res.test).to.equal('test');
    });

    it('should return expected result', async () => {
        const payload = {
            modelId: machineModel.id,
        };
        const result = await getModelInfoUOW(payload);
        expect(result.modelId).to.equal(machineModel.id);
        expect(result.machineTypeName).to.equal(machineType.name);
    });
});
