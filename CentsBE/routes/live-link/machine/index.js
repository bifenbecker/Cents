const router = require('express').Router({ mergeParams: true });

const centsCustomerAuthToken = require('../../../middlewares/liveLink/centsCustomerAuthToken');
const {
    getMachineDetailsByBarcode,
    getBusinessThemeByMachineBarcode,
    getTurnDetailsWithOrder,
    runMachine,
} = require('./liveLinkMachineController');

const getMachineDetailsLivelinkValidation = require('../../../validations/liveLink/machine/getMachineDetailsLivelinkValidation');
const getBusinessThemeByMachineBarcodeValidation = require('../../../validations/liveLink/machine/getBusinessThemeByMachineBarcodeValidation');
const getTurnDetailsWithOrderValidation = require('../../../validations/liveLink/machine/getTurnDetailsWithOrderValidation');
const runMachineSelfServiceValidation = require('../../../validations/machines/turns/runMachineSelfServiceValidation');

router.get(
    '/:barcode/details-by-barcode',
    centsCustomerAuthToken,
    getMachineDetailsLivelinkValidation,
    getMachineDetailsByBarcode,
);

router.get(
    '/:barcode/business-theme-by-barcode',
    getBusinessThemeByMachineBarcodeValidation,
    getBusinessThemeByMachineBarcode,
);

router.get(
    '/turns/:turnId/details',
    centsCustomerAuthToken,
    getTurnDetailsWithOrderValidation,
    getTurnDetailsWithOrder,
);

router.post('/:machineId/run', centsCustomerAuthToken, runMachineSelfServiceValidation, runMachine);

module.exports = router;
