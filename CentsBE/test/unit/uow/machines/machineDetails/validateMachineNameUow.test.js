require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const validateMachineNameUow = require('../../../../../uow/machines/machineDetails/validateMachineNameUow');

describe('test validateMachineNameUow', () => {
    let machine, machineModel, machineType;

    beforeEach(async () => {
        machineType = await factory.create('machineType');
        machineModel = await factory.create('machineModel', {
            typeId: machineType.id,
        });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
            name: 'LG230',
        });
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(validateMachineNameUow()).to.be.rejected;
        await expect(validateMachineNameUow(null)).to.be.rejected;
        await expect(validateMachineNameUow({})).to.be.rejected;
    });

    it('should fill payload with machine details', async () => {
        const payload = {
            field: 'name',
            value: 'DW100',
            machineId: machine.id,
        };

        await validateMachineNameUow(payload);

        expect(payload.storeId).to.equal(machine.storeId);
        expect(payload.modelId).to.equal(machineModel.id);
        expect(payload.machineTypeName).to.equal(machineType.name);
        expect(payload.name).to.equal(payload.value);
    });
});
