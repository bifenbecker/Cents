const router = require('express').Router({ mergeParams: true });

// Controllers
const {
    createQrCode,
    pairMachineWithQrCode,
    unpairMachineFromQrCode,
    removeQrCode,
} = require('./machineQrCodeController');
// Validations
const {
    pairMachineWithQrCodeValidation,
    unpairMachineFromQrCodeValidation,
    createQrCodeValidation,
} = require('../../../validations/liveLink/qr-code');

router.post('/create', createQrCodeValidation, createQrCode);
router.put('/pair', pairMachineWithQrCodeValidation, pairMachineWithQrCode);
router.put('/unpair', unpairMachineFromQrCodeValidation, unpairMachineFromQrCode);
router.delete('/:id', removeQrCode);

module.exports = router;
