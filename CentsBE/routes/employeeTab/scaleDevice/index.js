const router = require('express').Router();

// Controllers
const { attachStoreToScaleDevice } = require('./scaleDeviceController');

// Validations
const attachScaleDeviceToStoreValidation = require('../../../validations/employeeTab/scaleDevice/attachScaleDeviceToStore');

router.post('/store/attach', attachScaleDeviceToStoreValidation, attachStoreToScaleDevice);

module.exports = exports = router;
