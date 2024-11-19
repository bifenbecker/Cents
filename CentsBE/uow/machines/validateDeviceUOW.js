const Device = require('../../models/device');
/**
 *
 * validate a device
 * @param {*} payload
 */
async function validateDevice(payload) {
    const { transaction, storeId, deviceId } = payload;
    if (deviceId) {
        const device = await Device.query(transaction)
            .leftJoin('batches', 'batches.id', 'devices.batchId')
            .where('batches.storeId', storeId)
            .findById(deviceId);
        if (!device) {
            throw new Error('Device does not belong to the store.');
        }
        if (device && device.isPaired === true) {
            throw new Error('This device is already paired.');
        }
        if (device && device.status === 'OFFLINE') {
            throw new Error('This device is offline.');
        }
        if (device && device.status === 'IN_USE') {
            throw new Error('This device is in use.');
        }
    }
    return payload;
}
module.exports = exports = validateDevice;
