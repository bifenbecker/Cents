const router = require('express').Router();

const languages = require('./getLanguages');
const addCustomer = require('./addCustomer');
const getCustomerDetails = require('./getCustomerDetails');
const getCustomerOrders = require('./getCustomerOrders');
const updateCustomerNotes = require('./updateNotes');
const verifyCustomerDiscountService = require('./verifyCustomerDiscountService');
const {
    addEditCustomerValidations,
} = require('../../../validations/customers/addEditCustomerValidation');
const validateGuestAccount = require('./validateGuestAccount');
const getCustomerCredits = require('./getCredits');
const cardOnFile = require('./cardOnfile');
const editCustomer = require('./editCustomer');
const editCustomerAddress = require('./editCustomerAddress');
const addCustomerAddress = require('./addCustomerAddress');
const getCustomerPreferencesChoices = require('./getCustomerPreferencesChoices');

const singleCustomerValidator = require('../../../validations/singleRecord');
const {
    validateForRequestWithParams: validateAddressUpdate,
} = require('../../../validations/customers/addresses/updateCustomerAddress');
const addPreferenceChoicesForCustomer = require('./addPreferenceChoicesForCustomer');
const editPreferenceChoicesForCustomer = require('./editPreferenceChoicesForCustomer');
const editStorePreferences = require('./editStorePreferences');
const getBusinessPreferences = require('./getBusinessPreferences');
const getStorePreferences = require('./getStorePreferences');

// fixed version
const getCustomerPreferencesChoicesFixed = require('./preferences-fixed/getCustomerPreferencesChoices');
const updatePreferenceOptionSelection = require('./preferences-fixed/updatePreferenceOptionSelection');
const createPreferenceOptionSelection = require('./preferences-fixed/createPreferenceOptionSelection');
const deletePreferenceOptionSelection = require('./preferences-fixed/deletePreferenceOptionSelection');
const { storeCustomersList, businessCustomersList } = require('./customersList');
const {
    validateForRequestWithParams: validateAddressCreation,
} = require('../../../validations/customers/addresses/createCustomerAddress');

router.get('/', storeCustomersList);
router.get('/:id/details', getCustomerDetails);
router.get('/:id/orders', getCustomerOrders);
router.patch('/:id/notes', updateCustomerNotes);
router.get('/search', businessCustomersList);
router.get('/languages', languages);
router.post('/', addEditCustomerValidations, addCustomer);
router.get('/discounts', verifyCustomerDiscountService);
router.post('/guest', validateGuestAccount);

router.use('/:id/card-on-file', cardOnFile);
router.get('/:id/credits', singleCustomerValidator, getCustomerCredits);
router.put('/:id/edit', addEditCustomerValidations, editCustomer);
router.put('/:id/address/edit', validateAddressUpdate, editCustomerAddress);
router.post('/:id/address/create', validateAddressCreation, addCustomerAddress);

router.patch('/:id/preferences/business/:businessId/store/:storeId', editStorePreferences);
router.get('/:id/preferences/business/:businessId/store/:storeId', getStorePreferences);

router.get('/:id/business/:businessId/preferences-choices', getCustomerPreferencesChoicesFixed);
router.patch('/preferences-choices/selections/:selectionId', updatePreferenceOptionSelection);
router.post('/:id/preferences-choices/selections', createPreferenceOptionSelection);
router.delete('/preferences-choices/selections/:selectionId', deletePreferenceOptionSelection);

// Todo: obsolete, to delete
router.get('/:id/preferences/business/:businessId', getBusinessPreferences);
router.get('/:id/preferences-choices/:businessId', getCustomerPreferencesChoices);
router.post('/:id/preferences-choices/:businessId', addPreferenceChoicesForCustomer);
router.patch('/:id/preferences-choices/:businessId', editPreferenceChoicesForCustomer);

module.exports = exports = router;
