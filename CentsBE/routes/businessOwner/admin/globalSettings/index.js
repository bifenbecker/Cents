const router = require('express').Router();

const regionsValidation = require('../../../../validations/Regions/addRegion');
const accountSettingsValidation = require('../../../../validations/settings/accountSettings');
const accountDetails = require('./accountDetails');
const addDetails = require('./updateAccountDetails');
const addRegion = require('./addRegions');
const accountSettings = require('./accountSettings');
const getSettings = require('./getSettings');
const bankAccount = require('./bankAccount');
const deleteBagNoteTag = require('./deleteBagNoteTag');

router.get('/account-details', accountDetails);
router.put('/account-details', addDetails);
router.post('/regions', regionsValidation, addRegion);
router.patch('/account/settings', accountSettingsValidation, accountSettings);
router.get('/account/settings', getSettings);
router.use('/account/bank', bankAccount);
router.post('/account/bag-note-tag/:id/delete', deleteBagNoteTag);

module.exports = router;
