const router = require('express').Router();
const getPreferences = require('./getPreferences');
const createPreferences = require('./createPreferences');
const removePreference = require('./removePreference');
const updatePreference = require('./updatePreference');
const createPreferencesValidation = require('../../../../validations/preferences-fix/createPreferences');
const updatePreferenceValidation = require('../../../../validations/preferences-fix/updatePreference');
const createOption = require('./createOption');
const removeOption = require('./removeOption');
const updateOption = require('./updateOption');
const updateDefaultOption = require('./updateDefaultOption');
const createOptionValidation = require('../../../../validations/preferences-fix/createOption');
const updateOptionValidation = require('../../../../validations/preferences-fix/updateOption');
const updateDefaultOptionValidation = require('../../../../validations/preferences-fix/updateDefaultOptionValidation');

router.post('/options', createOptionValidation, createOption);
router.delete('/options/:id', removeOption);
router.patch('/options/default', updateDefaultOptionValidation, updateDefaultOption);
router.patch('/options/:id', updateOptionValidation, updateOption);
router.get('/', getPreferences);
router.post('/', createPreferencesValidation, createPreferences);
router.delete('/businesses/:businessId/preferences/:id', removePreference);
router.patch(
    '/businesses/:businessId/preferences/:id',
    updatePreferenceValidation,
    updatePreference,
);

module.exports = router;
