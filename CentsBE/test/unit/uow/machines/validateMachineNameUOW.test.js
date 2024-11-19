require('../../../testHelper');
const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const validateMachineNameUOW = require('../../../../uow/machines/validateMachineNameUOW');

describe('test validateMachineNameUOW', () => {
    let machine, machineType;

    beforeEach(async () => {
        machineType = await factory.create('machineType');
        const machineModel = await factory.create('machineModel', {
            typeId: machineType.id,
        });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
            name: 'LG230',
        });
    });

    it('should be rejected with an error if machine type name already exists', async () => {
        const payload = {
            name: machine.name,
            storeId: machine.storeId,
            machineTypeName: machineType.name,
        };

        await expect(validateMachineNameUOW(payload)).to.be.rejectedWith('Name already exists.');
    });

    it('should pass validation', async () => {
        const payload = {
            name: machine.name,
            storeId: machine.storeId,
            machineTypeName: 'New name',
        };

        await expect(validateMachineNameUOW(payload)).to.not.be.rejected;
    });

    it('should skip validation', async () => {
        await expect(validateMachineNameUOW({})).to.not.be.rejected;
    });
});
