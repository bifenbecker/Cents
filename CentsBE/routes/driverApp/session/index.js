const router = require('express').Router();
const signIn = require('./signIn');

const signInTypeValidations = require('../../../validations/driverApp/session/signIn');

router.post('/', signInTypeValidations, signIn);

module.exports = exports = router;
