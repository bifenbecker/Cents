require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const factory = require('../../../factories');
const updateMachineDetailsPipeline = require('../../../../pipeline/machines/updateMachineDetailsPipeline');
const Machine = require('../../../../models/machine');
const MachinePricing = require('../../../../models/machinePricing');

describe('test updateMachineDetailsPipeline', () => {
    let machine;

    beforeEach(async () => {
        machine = await factory.create('machine');
    });

    it('should update name field', async () => {
        const payload = {
            field: 'name',
            value: 'DW100',
            machineId: machine.id,
        };

        await updateMachineDetailsPipeline(payload);

        const result = await Machine.query().findById(machine.id);
        expect(result.name).to.equal(payload.value);
    });

    it('should update pricePerTurnInCents field', async () => {
        const machineType = await factory.create('machineType', {
                name: 'WASHER',
            }),
            machineModel = await factory.create('machineModel', {
                typeId: machineType.id,
            });

        machine = await factory.create('machine', {
            modelId: machineModel.id,
        });

        await factory.create('machinePricing', {
            machineId: machine.id,
        });

        const payload = {
            field: 'pricePerTurnInCents',
            value: 11,
            machineId: machine.id,
        };

        await updateMachineDetailsPipeline(payload);

        const result = await MachinePricing.query().findOne({
            machineId: machine.id,
        });
        expect(result.price).to.equal(payload.value);
    });

    it('should update serialNumber field', async () => {
        const payload = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
            machineId: machine.id,
        };

        await updateMachineDetailsPipeline(payload);

        const result = await Machine.query().findById(machine.id);
        expect(result.serialNumber).to.equal(payload.value);
    });

    it('should update turnTimeInMinutes field', async () => {
        const machineType = await factory.create('machineType', {
                name: 'DRYER',
            }),
            machineModel = await factory.create('machineModel', {
                typeId: machineType.id,
            });

        machine = await factory.create('machine', {
            modelId: machineModel.id,
        });

        const payload = {
            field: 'turnTimeInMinutes',
            value: 23,
            machineId: machine.id,
        };

        await updateMachineDetailsPipeline(payload);

        const result = await Machine.query().findById(machine.id);
        expect(result.turnTimeInMinutes).to.equal(payload.value);
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(updateMachineDetailsPipeline()).to.be.rejected;
        await expect(updateMachineDetailsPipeline(null)).to.be.rejected;
        await expect(updateMachineDetailsPipeline({})).to.be.rejected;
    });
});
