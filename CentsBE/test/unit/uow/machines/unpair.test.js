require('../../../testHelper');
const unpairMachine = require('../../../../uow/machines/unpair');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { expect } = require('../../../support/chaiHelper');
const { origins, deviceStatuses, turnStatuses } = require('../../../../constants/constants');
const Pairing = require('../../../../models/pairing');
const Device = require('../../../../models/device');
const Turns = require('../../../../models/turns');

const createMachineAndPairing = async (deviceStatus = deviceStatuses.ONLINE) => {
    const user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole),
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        }),
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        }),
        model = await factory.create(FACTORIES_NAMES.machineModel),
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
            modelId: model.id,
        }),
        device = await factory.create(FACTORIES_NAMES.device, {
            status: deviceStatus,
        });

    await factory.create(FACTORIES_NAMES.batch, {
        businessId: business.id,
        storeId: store.id,
    });

    const pairing = await factory.create(FACTORIES_NAMES.pairing, {
        machineId: machine.id,
        deviceId: device.id,
    });

    const turn = await factory.create(FACTORIES_NAMES.turn, {
        storeId: store.id,
        machineId: machine.id,
        deviceId: device.id,
        status: turnStatuses.RUNNING,
    });

    return {
        device,
        machine,
        user,
        pairing,
        turn,
    };
};

describe('test unpair uow', () => {
    it('should unpair device', async () => {
        const currentDate = new Date();

        const { device, machine, user, pairing, turn } = await createMachineAndPairing();

        const payload = {
            params: { machineId: machine.id },
            body: { userId: user.id, origin: origins.BUSINESS_MANAGER },
        };

        const result = await unpairMachine(payload);

        expect(result.id).to.equal(payload.params.machineId);

        const pairingInDb = await Pairing.query().findById(pairing.id);
        expect(pairingInDb).to.include({
            unPairedByUserId: payload.body.userId,
            origin: payload.body.origin,
        });
        expect(new Date(pairingInDb.deletedAt)).to.be.greaterThanOrEqual(currentDate);

        const deviceInDb = await Device.query().findById(device.id);
        expect(deviceInDb).to.include({ isPaired: false, isActive: false });

        const turnInDb = await Turns.query().findById(turn.id);
        expect(turnInDb.status).to.equal(turnStatuses.COMPLETED);
    });

    it('should unpair device without user', async () => {
        const currentDate = new Date();

        const { device, machine, pairing, turn } = await createMachineAndPairing();

        const payload = {
            params: { machineId: machine.id },
            body: { userId: null, origin: origins.BUSINESS_MANAGER },
        };

        const result = await unpairMachine(payload);

        expect(result.id).to.equal(payload.params.machineId);

        const pairingInDb = await Pairing.query().findById(pairing.id);
        expect(pairingInDb).to.include({
            unPairedByUserId: payload.body.userId,
            origin: payload.body.origin,
        });
        expect(new Date(pairingInDb.deletedAt)).to.be.greaterThanOrEqual(currentDate);

        const deviceInDb = await Device.query().findById(device.id);
        expect(deviceInDb).to.include({ isPaired: false, isActive: false });

        const turnInDb = await Turns.query().findById(turn.id);
        expect(turnInDb.status).to.equal(turnStatuses.COMPLETED);
    });

    it('should reject if device is offline', async () => {
        const { machine, user } = await createMachineAndPairing(deviceStatuses.OFFLINE);

        const payload = {
            params: { machineId: machine.id },
            body: { userId: user.id, origin: origins.BUSINESS_MANAGER },
        };

        await expect(unpairMachine(payload)).to.be.rejectedWith('Device is offline.');
    });

    it('should reject if invalid args were passed', async () => {
        await expect(unpairMachine()).to.be.rejected;
        await expect(unpairMachine(null)).to.be.rejected;
        await expect(unpairMachine({})).to.be.rejected;
    });
});
