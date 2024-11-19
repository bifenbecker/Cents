require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const validateMachineNamePipeline = require('../../../../pipeline/machines/validateMachineNamePipeline');

describe('validateMachineNamePipeline', () => {
    let machineType, store, machineModel, machine;
    beforeEach(async () => {
        store = await factory.create('store');
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', { typeId: machineType.id });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
            storeId: store.id,
        });
    });

    it('should throw error when incorrect model id provided', async () => {
        const payload = {
            name: 'test_name',
            modelId: 123456,
            storeId: store.id,
        };
        try {
            await validateMachineNamePipeline(payload);
        } catch (err) {
            expect(err.message).to.be.equal('invalid model id');
        }
    });

    it('should throw error when existed name provided', async () => {
        const payload = {
            name: machine.name,
            modelId: machineModel.id,
            storeId: store.id,
            machineTypeName: machine.name,
        };
        try {
            await validateMachineNamePipeline(payload);
        } catch (err) {
            expect(err.message).to.be.equal('Name already exists.');
        }
    });

    it('should add correct name to payload', async () => {
        const data = {
            name: 'test_name',
            modelId: machineModel.id,
            storeId: store.id,
        };

        const res = await validateMachineNamePipeline(data);
        expect(data.machineTypeName).equal(machineType.name);
    });
});
