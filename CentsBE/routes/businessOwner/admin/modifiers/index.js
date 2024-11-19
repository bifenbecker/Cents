const router = require('express').Router({ mergeParams: true });

const addModifier = require('./createModifier');
const updateModifier = require('./updateModifier');
const createValidator = require('../../../../validations/services/modifiers/createModifier');
const updateValidator = require('../../../../validations/services/modifiers/updateModifier');
const serviceAdder = require('../../../../utils/getPerPoundServices');

router.put('/:id', updateValidator, updateModifier);
router.post('/', createValidator, serviceAdder, addModifier);

module.exports = exports = router;
