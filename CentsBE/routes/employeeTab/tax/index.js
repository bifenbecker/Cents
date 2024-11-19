const router = require('express').Router();

// Controllers
const { fetchTaxRate } = require('./taxController');

// Validations
const validateTaxRequest = require('../../../validations/employeeTab/tax/getTaxDataValidation');

router.get('/', validateTaxRequest, fetchTaxRate);

module.exports = exports = router;
