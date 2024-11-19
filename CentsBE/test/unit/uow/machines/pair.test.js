require('../../../testHelper');
const pairMachine = require('../../../../uow/machines/pair');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { origins, MACHINE_TYPES } = require('../../../../constants/constants');
const { expect } = require('../../../support/chaiHelper');
const Machine = require('../../../../models/machine');
const Device = require('../../../../models/device');
const MachinePricing = require('../../../../models/machinePricing');
const Pairing = require('../../../../models/pairing');

const DRYER_PRICING = 25;

const createMachineWithType = async (typeName) => {
    const type = await factory.create(FACTORIES_NAMES.machineType, {
            name: typeName,
        }),
        model = await factory.create(FACTORIES_NAMES.machineModel, {
            typeId: type.id,
        }),
        machine = await factory.create(FACTORIES_NAMES.machine, {
            modelId: model.id,
        });

    return machine;
};

const checkMachineDataInDb = async (payload, expectedPrice = DRYER_PRICING) => {
    const machineInDb = await Machine.query().findById(payload.machineId);
    expect(machineInDb.origin).to.equal(payload.user.source);
    expect(machineInDb.userId).to.equal(payload.user.id);

    const pricingInDb = await MachinePricing.query()
        .where({ machineId: payload.machineId })
        .first();
    expect(pricingInDb.price).to.equal(expectedPrice);

    const deviceInDb = await Device.query().findById(payload.deviceId);
    expect(deviceInDb.isPaired).to.be.true;

    const pairingInDb = await Pairing.query()
        .where({
            machineId: payload.machineId,
            deviceId: payload.deviceId,
        })
        .first();
    expect(pairingInDb.origin).to.equal(payload.user.source);
    expect(pairingInDb.pairedByUserId).to.equal(payload.user.id);

    return machineInDb;
};

describe('test pair uow', () => {
    let device, user;

    beforeEach(async () => {
        device = await factory.create(FACTORIES_NAMES.device);
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
    });

    describe('for employee app source', () => {
        beforeEach(() => {
            user.source = origins.EMPLOYEE_APP;
            user.userId = user.id;
        });

        it('should pair and update price for a dryer machine', async () => {
            const machine = await createMachineWithType(MACHINE_TYPES.DRYER);
            machine.type = MACHINE_TYPES.DRYER;

            const payload = {
                deviceId: device.id,
                machineId: machine.id,
                machine,
                turnTime: 2,
                user,
            };

            const result = await pairMachine(payload);
            expect(result).to.equal(payload);

            const machineInDb = await checkMachineDataInDb(payload);
            expect(machineInDb.turnTimeInMinutes).to.equal(payload.turnTime);
        });

        it('should pair and update price for a washer machine', async () => {
            const machine = await createMachineWithType(MACHINE_TYPES.WASHER);
            machine.type = MACHINE_TYPES.WASHER;

            const payload = {
                deviceId: device.id,
                machineId: machine.id,
                machine,
                pricePerTurnInCents: 11,
                turnTime: 2,
                user,
            };

            const result = await pairMachine(payload);
            expect(result).to.equal(payload);

            await checkMachineDataInDb(payload, payload.pricePerTurnInCents);
        });

        it('should pair and update existing price', async () => {
            const machine = await createMachineWithType(MACHINE_TYPES.WASHER);
            machine.type = MACHINE_TYPES.WASHER;

            const pricing = await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                deletedAt: null,
                isDeleted: false,
            });

            const payload = {
                deviceId: device.id,
                machineId: machine.id,
                machine,
                pricePerTurnInCents: 11,
                turnTime: 2,
                user,
            };

            const result = await pairMachine(payload);
            expect(result).to.equal(payload);

            await checkMachineDataInDb(payload, payload.pricePerTurnInCents);

            const pricingInDb = await MachinePricing.query().findById(pricing.id);
            expect(pricingInDb.price).to.equal(payload.pricePerTurnInCents);
        });
    });

    describe('for business manager source', () => {
        beforeEach(() => {
            user.source = origins.BUSINESS_MANAGER;
        });

        it('should pair and update price for a dryer machine', async () => {
            const machine = await createMachineWithType(MACHINE_TYPES.DRYER);
            machine.type = MACHINE_TYPES.DRYER;

            const payload = {
                deviceId: device.id,
                machineId: machine.id,
                machine,
                turnTime: 2,
                user,
            };

            const result = await pairMachine(payload);
            expect(result).to.equal(payload);

            const machineInDb = await checkMachineDataInDb(payload);
            expect(machineInDb.turnTimeInMinutes).to.equal(payload.turnTime);
        });

        it('should pair and update price for a washer machine', async () => {
            const machine = await createMachineWithType(MACHINE_TYPES.WASHER);
            machine.type = MACHINE_TYPES.WASHER;

            const payload = {
                deviceId: device.id,
                machineId: machine.id,
                machine,
                pricePerTurnInCents: 11,
                turnTime: 2,
                user,
            };

            const result = await pairMachine(payload);
            expect(result).to.equal(payload);

            await checkMachineDataInDb(payload, payload.pricePerTurnInCents);
        });

        it('should pair and update existing price', async () => {
            const machine = await createMachineWithType(MACHINE_TYPES.WASHER);
            machine.type = MACHINE_TYPES.WASHER;

            const pricing = await factory.create(FACTORIES_NAMES.machinePricing, {
                machineId: machine.id,
                deletedAt: null,
                isDeleted: false,
            });

            const payload = {
                deviceId: device.id,
                machineId: machine.id,
                machine,
                pricePerTurnInCents: 11,
                turnTime: 2,
                user,
            };

            const result = await pairMachine(payload);
            expect(result).to.equal(payload);

            await checkMachineDataInDb(payload, payload.pricePerTurnInCents);

            const pricingInDb = await MachinePricing.query().findById(pricing.id);
            expect(pricingInDb.price).to.equal(payload.pricePerTurnInCents);
        });
    });

    it('should be rejected if invalid args were passed', async () => {
        await expect(pairMachine()).to.be.rejected;
        await expect(pairMachine(null)).to.be.rejected;
        await expect(pairMachine({})).to.be.rejected;
    });
});
