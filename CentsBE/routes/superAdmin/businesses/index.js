const router = require('express').Router();

// Controllers
const {
    getAllBusinesses,
    createNewBusiness,
    updateFieldValueForBusiness,
    getAllStoresPerBusiness,
    searchBusinesses,
    getAllBusinessesSimple,
    updateBusinessSettings,
    getIndividualBusiness,
} = require('./businessController');

// Validations
const createNewBusinessValidation = require('../../../validations/superAdmin/businesses/createNewBusiness');
const updateIndividualBusinessValueValidation = require('../../../validations/superAdmin/businesses/updateIndividualValueForBusiness');
const updateBusinessSettingsValidation = require('../../../validations/superAdmin/businesses/updateIndividualValueForBusinessSettings');

router.get('/all', getAllBusinesses);
router.get('/all/simple', getAllBusinessesSimple);
router.get('/all/search', searchBusinesses);
router.put('/:id/update', updateIndividualBusinessValueValidation, updateFieldValueForBusiness);
router.get('/:id/stores', getAllStoresPerBusiness);
router.post('/create', createNewBusinessValidation, createNewBusiness);
router.put('/business/settings/update', updateBusinessSettingsValidation, updateBusinessSettings);
router.get('/:id/get', getIndividualBusiness);

module.exports = exports = router;
