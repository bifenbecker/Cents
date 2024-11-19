const Device = require('../../../models/device');
const { deviceStatuses } = require('../../../constants/constants');

async function updateDeviceStatusUow(payload) {
    const { transaction, deviceId, activePairing } = payload;
    const newPayload = payload;
    if (deviceId && activePairing && activePairing.device.status !== deviceStatuses.OFFLINE) {
        const device = await Device.query(transaction).findById(deviceId);
        newPayload.device = device;
    }
    return newPayload;
}
module.exports = {
    updateDeviceStatusUow,
};
