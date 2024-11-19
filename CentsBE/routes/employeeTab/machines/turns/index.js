const router = require('express').Router();

const details = require('../../../businessOwner/machine/turns/details');

// validations
const getDetailsValidation = require('../../../../validations/machines/turns/getTurnDetails');

router.get('/:turnId', getDetailsValidation, details);

module.exports = router;
