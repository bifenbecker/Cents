const router = require('express').Router();
const getModifiers = require('./getModifiers');

const getModifiersValidation = require('../../../../../validations/services/getModifiers');

router.get('/:serviceId', getModifiersValidation, getModifiers);

module.exports = router;
