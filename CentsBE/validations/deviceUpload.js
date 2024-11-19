const { uniq } = require('lodash');

const Device = require('../models/device');

async function validateFile(uploadedData) {
    try {
        const result = {};
        const deviceNames = uploadedData.map((device) => device.DeviceId);
        if (deviceNames.includes(undefined)) {
            result.error = true;
            result.message = 'The CSV should contain columns DeviceId.';
            result.code = 422;
            return result;
        }
        const uniqueDeviceName = uniq(deviceNames);
        if (uniqueDeviceName.length !== deviceNames.length) {
            result.error = true;
            result.message = 'Duplicates found in CSV';
            result.status = 400;
            return result;
        }
        const devices = await Device.query().whereIn('name', deviceNames);
        if (devices.length) {
            result.error = true;
            result.message = 'Device already exists';
            result.code = 400;
            return result;
        }
        result.error = false;
        result.deviceNames = deviceNames;
        return result;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = validateFile;
