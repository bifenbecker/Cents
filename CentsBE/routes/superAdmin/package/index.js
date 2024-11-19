const router = require('express').Router();

// Controllers
const createSubscriptionPackage = require('./createSubscriptionPackage');

// Validations
const createPackageValidation = require('../../../validations/subscription/createPackage');

router.post('/create', createPackageValidation, createSubscriptionPackage);

module.exports = exports = router;
