require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const faker = require('faker');

const addMachineUOW = require('../../../../uow/machines/addMachineUOW');
const Machine = require('../../../../models/machine');
const MachinePricing = require('../../../../models/machinePricing');
const Pairing = require('../../../../models/pairing');
const Device = require('../../../../models/device');

describe('addMachineUOW test', () => {
    let payload, store, machineModel, user, device;
    beforeEach(async () => {
        store = await factory.create('store');
        machineModel = await factory.create('machineModel');
        user = await factory.create('user');
        device = await factory.create('device');
        payload = {
            userId: user.id,
            origin: faker.random.word(),
            deviceId: device.id,
            storeId: store.id,
            modelId: machineModel.id,
            name: faker.random.word(),
            serialNumber: faker.random.uuid(),
            pricePerTurnInCents: 15,
            turnTimeInMinutes: 2,
        };
        await addMachineUOW(payload);
    });

    it('should insert machine entry successfully', async () => {

        const machine = await Machine.query().where({ storeId: payload.storeId }).first();
        expect(machine.name).equal(payload.name);
        expect(machine.userId).equal(payload.userId);
        expect(machine.origin).equal(payload.origin);
        expect(machine.modelId).equal(payload.modelId);
        expect(machine.serialNumber).equal(payload.serialNumber);
        expect(machine.turnTimeInMinutes).equal(payload.turnTimeInMinutes);
    });

    it('should insert machinePricing entry successfully', async () => {
        const machine = await Machine.query().where({ storeId: payload.storeId }).first();
        const machinePricing = await MachinePricing.query()
            .where({ machineId: machine.id })
            .first();
        expect(machinePricing).exist;
        expect(machinePricing.price).equal(payload.pricePerTurnInCents);
    });

    it('should insert pairing entry successfully', async () => {
        const pairing = await Pairing.query().where({ deviceId: payload.deviceId }).first();

        expect(pairing).exist;
        expect(pairing.origin).equal(payload.origin);
        expect(pairing.pairedByUserId).equal(payload.userId);
    });

    it('should update device successfully', async () => {
        const device = await Device.query().where({ id: payload.deviceId }).first();

        expect(device.isPaired).equal(true);
        expect(device.isActive).equal(true);
    });

    it('should throw error if no data provided', async () => {
        await expect(addMachineUOW({})).to.be.rejected;
    });
});
