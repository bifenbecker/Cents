const router = require('express').Router();

const devices = require('../../../businessOwner/machine/devices');

// validations
const unPairedOnlineDevicesListValidator = require('../../../../validations/machines/unPairedOnlineDevicesList');

router.get('/', unPairedOnlineDevicesListValidator, devices);

module.exports = router;
