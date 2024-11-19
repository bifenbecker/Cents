require('../../../testHelper');
const factory = require('../../../factories');
const { FACTORIES_NAMES } = require('../../../constants/factoriesNames');
const pairingPipeline = require('../../../../pipeline/machines/pairing');
const { expect } = require('../../../support/chaiHelper');
const { deviceStatuses, origins } = require('../../../../constants/constants');
const Device = require('../../../../models/device');
const Pairing = require('../../../../models/pairing');
const { connectToMongodb } = require('../../../support/mongodbHelper');

describe('test pairing pipeline', () => {
    let user, business, store, machine, batch, device;

    beforeEach(async () => {
        await connectToMongodb();
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
        batch = await factory.create(FACTORIES_NAMES.batch, {
            businessId: business.id,
            storeId: store.id,
        });
        device = await factory.create(FACTORIES_NAMES.device, {
            status: deviceStatuses.ONLINE,
            batchId: batch.id,
            name: 'AA100',
            isPaired: false,
        });
    });

    it('should pair a device', async () => {
        const payload = {
            deviceId: device.id,
            machineId: machine.id,
            id: machine.id,
            businessId: business.id,
            machine: {
                ...machine,
                type: 'WASHER',
            },
            pricePerTurnInCents: 10,
            user: {
                source: origins.BUSINESS_MANAGER,
                id: user.id,
            },
        };

        const result = await pairingPipeline(payload);
        expect(result.id).to.equal(machine.id);

        const deviceInDb = await Device.query().findById(device.id);
        expect(deviceInDb.isPaired).to.be.true;

        const pairingInDb = await Pairing.query()
            .where({
                machineId: machine.id,
                deviceId: device.id,
            })
            .first();
        expect(pairingInDb).to.exist;
    });

    it('should be rejected if device is not found', async () => {
        const payload = {
            deviceId: -1,
            machineId: machine.id,
            id: machine.id,
            businessId: business.id,
            machine: {
                ...machine,
                type: 'WASHER',
            },
            pricePerTurnInCents: 10,
            user: {
                source: origins.BUSINESS_MANAGER,
                id: user.id,
            },
        };

        await expect(pairingPipeline(payload)).to.be.rejected;
    });
});
