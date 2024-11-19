const router = require('express').Router();
// # api region
const login = require('./logIn');
// #end region

// # validations region
const loginTypeValidations = require('../../../validations/employeeTab/signIn/login');
// #end region
router.post('/', loginTypeValidations, login);

module.exports = exports = router;
