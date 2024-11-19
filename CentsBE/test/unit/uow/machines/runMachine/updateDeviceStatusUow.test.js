require('../../../../testHelper');
const {
    updateDeviceStatusUow,
} = require('../../../../../uow/machines/runMachine/updateDeviceStatusUow');
const { FACTORIES_NAMES } = require('../../../../constants/factoriesNames');
const factory = require('../../../../factories');
const { expect } = require('../../../../support/chaiHelper');
const { deviceStatuses } = require('../../../../../constants/constants');

describe('test updateDeviceStatusUow', () => {
    it('should add active device to payload', async () => {
        const device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.ONLINE,
            }),
            activePairing = await factory.create(FACTORIES_NAMES.pairing, {
                deviceId: device.id,
            });

        activePairing.device = device;

        const payload = {
            deviceId: device.id,
            activePairing,
        };

        const result = await updateDeviceStatusUow(payload);

        expect(result).to.equal(payload);
        expect(result.device).to.exist;
        expect(result.device.id).to.equal(payload.deviceId);
    });

    it("shouldn't add inactive device to payload", async () => {
        const device = await factory.create(FACTORIES_NAMES.device, {
                status: deviceStatuses.OFFLINE,
            }),
            activePairing = await factory.create(FACTORIES_NAMES.pairing, {
                deviceId: device.id,
            });

        activePairing.device = device;

        const payload = {
            deviceId: device.id,
            activePairing,
        };

        const result = await updateDeviceStatusUow(payload);

        expect(result).to.equal(payload);
        expect(result.device).to.not.exist;
    });

    it('should reject if invalid args were passed', async () => {
        await expect(updateDeviceStatusUow()).to.be.rejected;
        await expect(updateDeviceStatusUow(null)).to.be.rejected;
    });
});
