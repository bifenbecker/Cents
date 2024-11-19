const DeviceUtils = require('./DeviceUtils');
const PusherOperations = require('../../../pusher/PusherOperations');

class Presence {
    constructor({ deviceName, status }) {
        this.name = deviceName;
        this.status = status;
        this.device = null;
    }

    getStatus(activeTurn) {
        if (this.status === 'OFFLINE') {
            return this.status;
        }
        return activeTurn.id ? 'IN_USE' : 'ONLINE';
    }

    async execute() {
        this.device = await DeviceUtils.findDevice(this.name.trim());
        const activeTurn = await DeviceUtils.activeTurn({ deviceId: this.device.id });
        const updatedDevice = await DeviceUtils.updateDevice(this.device.id, {
            status: this.getStatus(activeTurn),
            lastOfflineAt: this.status === 'OFFLINE' ? new Date() : null,
        });
        const storeId = await DeviceUtils.getStore(this.device.id);
        if (storeId) {
            const response = await DeviceUtils.getInUseResponse({
                device: updatedDevice,
                turn: activeTurn,
            });
            await PusherOperations.publishStoreEvent(storeId, response);
        }
    }
}

module.exports = exports = Presence;
