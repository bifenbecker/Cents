require('../../../testHelper');
const { expect } = require('../../../support/chaiHelper');
const validateMachineName = require('../../../../uow/machines/validateMachineNameUOW');
const factory = require('../../../factories');
const getModelInfo = require('../../../../uow/machines/getModelInfoUOW');
const validateDevice = require('../../../../uow/machines/validateDeviceUOW');

describe('test business-owners device validation uow', () => {
    let store, batch, device;

    beforeEach(async () => {
        store = await factory.create('store');
        batch = await factory.create('batch', {
            storeId: store.id,
        });
    });

    it('should throw error when device is already paired', async () => {
        device = await factory.create('device', {
            batchId: batch.id,
            isPaired: true
        });
        const payload = {
            storeId: store.id,
            deviceId: device.id,
        };

        try {
            await validateDevice(payload);
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('This device is already paired.');
        }
    });

    it('should throw error when device does not belong to the store', async () => {
        device = await factory.create('device', {
            batchId: batch.id,
            isPaired: false
        });
        const payload = {
            storeId: null,
            deviceId: device.id,
        };

        try {
            await validateDevice(payload);
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('Device does not belong to the store.');
        }
    });

    it('should throw error when device is offline', async () => {
        device = await factory.create('device', {
            batchId: batch.id,
            isPaired: false,
            status: 'OFFLINE'
        });
        const payload = {
            storeId: store.id,
            deviceId: device.id
        };

        try {
            await validateDevice(payload);
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('This device is offline.');
        }
    });

    it('should throw error when device is in use', async () => {
        device = await factory.create('device', {
            batchId: batch.id,
            isPaired: false,
            status: 'IN_USE'
        });
        const payload = {
            storeId: store.id,
            deviceId: device.id
        };

        try {
            await validateDevice(payload);
        } catch (error) {
            expect(error).to.be.an('Error');
            expect(error.message).to.equal('This device is in use.');
        }
    });
});
