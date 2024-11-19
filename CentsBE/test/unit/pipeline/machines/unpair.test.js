require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const { deviceStatuses, origins } = require('../../../../constants/constants');
const { expect, chai } = require('../../../support/chaiHelper');
const unpairPipeline = require('../../../../pipeline/machines/unpair');
const eventEmitter = require('../../../../config/eventEmitter');

describe('test unpairPipeline', () => {
    let business, store, machine, device, user, emitSpy;

    beforeEach(async () => {
        user = await factory.create(FACTORIES_NAMES.userWithBusinessOwnerRole);
        business = await factory.create(FACTORIES_NAMES.laundromatBusiness, {
            userId: user.id,
        });
        store = await factory.create(FACTORIES_NAMES.store, {
            businessId: business.id,
        });
        machine = await factory.create(FACTORIES_NAMES.machine, {
            storeId: store.id,
        });
        await factory.create(FACTORIES_NAMES.batch, {
            businessId: business.id,
            storeId: store.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            status: deviceStatuses.ONLINE,
        });

        await factory.create(FACTORIES_NAMES.pairing, {
            machineId: machine.id,
            deviceId: device.id,
        });
        emitSpy = chai.spy.on(eventEmitter, 'emit');
    });

    afterEach(() => {
        chai.spy.restore(eventEmitter);
    });

    it('should unpair device', async () => {
        const payload = {
            params: { machineId: machine.id },
            body: { userId: user.id, origin: origins.BUSINESS_MANAGER },
        };

        const result = await unpairPipeline(payload);
        expect(result.id).to.equal(payload.params.machineId);
        expect(emitSpy).to.have.been.called.with('machine-unpaired', {
            storeId: store.id,
            payload: { machineId: payload.params.machineId },
        });
    });

    it('should fail if invalid args were passed', async () => {
        await expect(unpairPipeline()).to.be.rejected;
        await expect(unpairPipeline(null)).to.be.rejected;
        await expect(unpairPipeline({})).to.be.rejected;
    });
});
