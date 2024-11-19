const router = require('express').Router();

// Controller methods
const {
    getAllPartnerEntities,
    createPartnerEntity,
    getIndividualPartner,
    updateIndividualPartnerEntity,
    updateIndividualPartnerSubsidiary,
    addPaymentMethodToSubsidiary,
    attachPartnerSubsidiaryToStore,
    createNewPartnerSubsidiary,
} = require('./partnersController');

// Validations
const updatePartnerSubsidiaryValidation = require('../../../validations/superAdmin/partners/updatePartnerSubsidiary');

router.get('/all', getAllPartnerEntities);
router.post('/create', createPartnerEntity);
router.get('/:id', getIndividualPartner);
router.put('/:id/update', updateIndividualPartnerEntity);
router.put(
    '/:id/subsidiary/update',
    updatePartnerSubsidiaryValidation,
    updateIndividualPartnerSubsidiary,
);
router.put('/:id/subsidiary/payment', addPaymentMethodToSubsidiary);
router.put('/:id/subsidiary/store/attach', attachPartnerSubsidiaryToStore);
router.post('/:id/subsidiary/create', createNewPartnerSubsidiary);

module.exports = exports = router;
