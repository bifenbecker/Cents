require('../../../../testHelper');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const {
    getMachineDetailsUow,
} = require('../../../../../uow/machines/machineDetails/getMachineDetailsUow');
const MachineTurnsStats = require('../../../../../models/machineTurnsStats');

describe('test getMachineDetailsUow', () => {
    let business, store, machine, machinePricing, device;

    beforeEach(async () => {
        business = await factory.create('laundromatBusiness');
        store = await factory.create('store', {
            businessId: business.id,
        });
        machine = await factory.create('machine', {
            storeId: store.id,
        });
        machinePricing = await factory.create('machinePricing', {
            machineId: machine.id,
        });
        device = await factory.create('device');
    });

    it('should reject if machine was not found', async () => {
        const payload = {
            id: -1,
            businessId: business.id,
        };

        await expect(getMachineDetailsUow(payload)).to.be.rejectedWith('Machine not found');
    });

    it('should be rejected with an error if passed payload with incorrect data', async () => {
        await expect(getMachineDetailsUow()).to.be.rejected;
        await expect(getMachineDetailsUow(null)).to.be.rejected;
        await expect(getMachineDetailsUow({})).to.be.rejected;
    });

    it('should return expected result', async () => {
        const configuration = await factory.create('machineConfiguration', {
            LaundryMachineID: machine.id,
        });

        await factory.create('pairing', {
            machineId: machine.id,
            deviceId: device.id,
        });

        const payload = {
            id: machine.id,
            businessId: business.id,
        };

        const result = await getMachineDetailsUow(payload);

        expect(result).to.include({
            id: machine.id,
            name: machine.name,
            serialNumber: machine.serialNumber,
            pricePerTurnInCents: machinePricing.price,
            turnTimeInMinutes: machine.turnTimeInMinutes,
            avgTurnsPerDay: 0,
            avgSelfServeRevenuePerDay: 0,
        });

        expect(result.store.id).to.equal(store.id);
        expect(result.prefix).to.not.be.null;
        expect(result.model).to.not.be.null;
        expect(result.device.id).to.equal(device.id);
        expect(result.activeTurn).to.not.be.null;
        expect(result.totalCoinsUsed).to.equal(configuration.CoinTotal);
    });

    it('should return expected result with default values', async () => {
        await factory.create('pairing', {
            machineId: machine.id,
            deviceId: device.id,
        });

        // delete stats so uow will set default values
        await MachineTurnsStats.query().delete().where({
            machineId: machine.id,
        });

        const payload = {
            id: machine.id,
            businessId: business.id,
        };

        const result = await getMachineDetailsUow(payload);

        expect(result).to.include({
            id: machine.id,
            name: machine.name,
            serialNumber: machine.serialNumber,
            pricePerTurnInCents: machinePricing.price,
            turnTimeInMinutes: machine.turnTimeInMinutes,
            avgTurnsPerDay: null,
            avgSelfServeRevenuePerDay: null,
        });

        expect(result.store.id).to.equal(store.id);
        expect(result.prefix).to.not.be.null;
        expect(result.model).to.not.be.null;
        expect(result.device.id).to.equal(device.id);
        expect(result.activeTurn).to.not.be.null;
        expect(result.totalCoinsUsed).to.equal(0);
    });
});
