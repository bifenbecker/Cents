const router = require('express').Router();

// Controllers
const {
    getAllScaleDevices,
    registerNewScaleDevice,
    getIndividualScaleDevice,
    attachStoreToScaleDevice,
    searchScaleDevices,
} = require('./scaleDeviceController');

// Validations
const registerNewScaleDeviceValidation = require('../../../validations/superAdmin/scaleDevices/registerNewScaleDevice');
const attachScaleDeviceToStoreValidation = require('../../../validations/superAdmin/scaleDevices/attachScaleDeviceToStore');

router.get('/all', getAllScaleDevices);
router.get('/all/search', searchScaleDevices);
router.post('/register', registerNewScaleDeviceValidation, registerNewScaleDevice);
router.get('/:id', getIndividualScaleDevice);
router.get('/:id', getIndividualScaleDevice);
router.post('/:id/store/attach', attachScaleDeviceToStoreValidation, attachStoreToScaleDevice);

module.exports = exports = router;
