const router = require('express').Router({ mergeParams: true });

const updateSettings = require('./update');
const intakeOnly = require('./isIntakeOnly');
const toggleResidential = require('./toggleResidential');
const intakeOnlyValidator = require('../../../../../validations/locations/settings/isInTakeOnly');

router.patch('/:id', updateSettings);
router.patch('/intake-only/:id', intakeOnlyValidator, intakeOnly);
router.patch('/residential/:id', toggleResidential);

module.exports = exports = router;
