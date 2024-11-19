require('../../../testHelper');

const factory = require('../../../factories');
const { expect } = require('../../../support/chaiHelper');
const validateDeviceUOW = require('../../../../uow/machines/validateDeviceUOW');

describe('validateDeviceUOW test', () => {
    let store, batch;
    beforeEach(async () => {
        store = await factory.create('store');
        batch = await factory.create('batch', { storeId: store.id });
    });

    it('should return unchanged payload', async () => {
        const payload = {
            storeId: store.id,
        };
        const res = await validateDeviceUOW(payload);
        expect(res.storeId).to.equal(payload.storeId);
    });

    it('should throw error when wrong storeId provided', async () => {
        const device = await factory.create('device', { batchId: batch.id });
        const payload = {
            deviceId: device.id,
            storeId: 12345,
        };

        try {
            await validateDeviceUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('Device does not belong to the store.');
        }
    });

    it('should throw error when device already paired', async () => {
        const device = await factory.create('device', {
            batchId: batch.id,
            isPaired: true,
        });
        const payload = {
            deviceId: device.id,
            storeId: store.id,
        };

        try {
            await validateDeviceUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('This device is already paired.');
        }
    });

    it('should throw error when device is offline', async () => {
        const device = await factory.create('device', {
            batchId: batch.id,
            status: 'OFFLINE',
            isPaired: false,
        });
        const payload = {
            deviceId: device.id,
            storeId: store.id,
        };

        try {
            await validateDeviceUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('This device is offline.');
        }
    });

    it('should throw error when device is in use', async () => {
        const device = await factory.create('device', {
            batchId: batch.id,
            status: 'IN_USE',
            isPaired: false,
        });
        const payload = {
            deviceId: device.id,
            storeId: store.id,
        };

        try {
            await validateDeviceUOW(payload);
        } catch (err) {
            expect(err.message).to.equal('This device is in use.');
        }
    });
});
