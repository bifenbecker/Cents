const router = require('express').Router();

const details = require('./details');

// validations
const getDetailsValidation = require('../../../../validations/machines/turns/getTurnDetails');

router.get('/:turnId', getDetailsValidation, details);

module.exports = router;
