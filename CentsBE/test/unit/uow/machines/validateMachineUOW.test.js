require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const validateMachineUOW = require('../../../../uow/machines/validateMachineUOW');

describe('test validateMachineUOW', () => {
    it('should reject if machine was not found', async () => {
        const payload = {
            machineId: -1,
        };

        await expect(validateMachineUOW(payload)).to.be.rejectedWith('Invalid machine id.');
    });

    it('should set is new machine', async () => {
        const payload = {};
        await validateMachineUOW(payload);
        expect(payload.isNewMachine).to.be.true;
    });

    it('should set is not new machine', async () => {
        const machine = await factory.create('machine');

        const payload = {
            machineId: machine.id,
        };
        const result = await validateMachineUOW(payload);
        expect(payload.isNewMachine).to.be.false;
        expect(result.machineId).to.equal(payload.machineId);
    });
});
