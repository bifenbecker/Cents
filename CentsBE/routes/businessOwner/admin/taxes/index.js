const router = require('express').Router();

const createTax = require('./createTax');
const updateTax = require('./updateTax');
const getTaxes = require('./getTaxes');

const createTaxValidation = require('../../../../validations/taxes/createTax');
const updateTaxValidation = require('../../../../validations/taxes/updateTax');

router.get('/', getTaxes);
router.post('/', createTaxValidation, createTax);
router.put('/:id', updateTaxValidation, updateTax);

module.exports = router;
