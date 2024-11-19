const router = require('express').Router({ mergeParams: true });

const updateEsdSettings = require('./updateEsdSettings');
const registerCashCardSettings = require('./registerCashCardSettings');

const validateCashCardSettings = require('../../../../../validations/locations/cashCard/registerCashCardSettings');

router.put('/settings', updateEsdSettings);
router.post('/register', validateCashCardSettings, registerCashCardSettings);

module.exports = exports = router;
