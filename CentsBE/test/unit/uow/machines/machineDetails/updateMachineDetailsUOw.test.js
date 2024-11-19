require('../../../../testHelper');
const { expect } = require('../../../../support/chaiHelper');
const factory = require('../../../../factories');
const updateMachineDetailsUOw = require('../../../../../uow/machines/machineDetails/updateMachineDetailsUOw');
const Machine = require('../../../../../models/machine');
const MachinePricing = require('../../../../../models/machinePricing');

describe('test updateMachineDetailsUOw', () => {
    let machine, machineType, machineModel;

    beforeEach(async () => {
        machineType = await factory.create('machineType', {
            name: 'WASHER',
        });
        machineModel = await factory.create('machineModel', {
            typeId: machineType.id,
        });
        machine = await factory.create('machine', {
            modelId: machineModel.id,
        });
    });

    it('should update name field', async () => {
        const payload = {
            field: 'name',
            value: 'DW100',
            machineId: machine.id,
            machineTypeName: machineType.name,
        };

        await updateMachineDetailsUOw(payload);

        const result = await Machine.query().findById(machine.id);
        expect(result.name).to.equal(payload.value);
    });

    it('should throw an error when updating pricePerTurnInCents field for a non-washer machine', async () => {
        machineType = await factory.create('machineType', {
            name: 'DRYER',
        });
        machineModel = await factory.create('machineModel', {
            typeId: machineType.id,
        });

        machine = await factory.create('machine', {
            modelId: machineModel.id,
        });

        const payload = {
            field: 'pricePerTurnInCents',
            value: 11,
            machineId: machine.id,
            machineTypeName: machineType.name,
        };

        await expect(updateMachineDetailsUOw(payload)).to.be.rejectedWith(
            'pricePerTurnInCents is applicable for washers only',
        );
    });

    it('should update pricePerTurnInCents field', async () => {
        await factory.create('machinePricing', {
            machineId: machine.id,
        });

        const payload = {
            field: 'pricePerTurnInCents',
            value: 11,
            machineId: machine.id,
            machineTypeName: machineType.name,
        };

        await updateMachineDetailsUOw(payload);

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

        await updateMachineDetailsUOw(payload);

        const result = await Machine.query().findById(machine.id);
        expect(result.serialNumber).to.equal(payload.value);
    });

    it('should throw an error when updating turnTimeInMinutes field for a non-dryer machine', async () => {
        const payload = {
            field: 'turnTimeInMinutes',
            value: 23,
            machineId: machine.id,
            machineTypeName: machineType.name,
        };

        await expect(updateMachineDetailsUOw(payload)).to.be.rejectedWith(
            'turnTimeInMinutes is applicable for dryers only',
        );
    });

    it('should update turnTimeInMinutes field', async () => {
        machineType = await factory.create('machineType', {
            name: 'DRYER',
        });
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
            machineTypeName: machineType.name,
        };

        await updateMachineDetailsUOw(payload);

        const result = await Machine.query().findById(machine.id);
        expect(result.turnTimeInMinutes).to.equal(payload.value);
    });

    it('should be rejected with an error if invalid machine id was passed', async () => {
        const payload = {
            field: 'serialNumber',
            value: 'ash3-dk137-dslfk4',
            machineId: 'some value',
        };

        await expect(updateMachineDetailsUOw(payload)).to.be.rejected;
    });
});
