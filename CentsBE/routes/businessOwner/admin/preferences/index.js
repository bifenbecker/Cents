const router = require('express').Router();
const getPreferences = require('./getPreferences');
const createPreferences = require('./createPreferences');
const removePreference = require('./removePreference');
const updatePreference = require('./updatePreference');
const createPreferencesValidation = require('../../../../validations/preferences/createPreferences');
const updatePreferenceValidation = require('../../../../validations/preferences/updatePreference');

router.get('/', getPreferences);
router.post('/', createPreferencesValidation, createPreferences);
router.delete('/:businessId/:id', removePreference);
router.patch('/:businessId/:id', updatePreferenceValidation, updatePreference);

module.exports = router;
