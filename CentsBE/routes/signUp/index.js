const router = require('express').Router();

const signUp = require('./signUp');
const signUpValidation = require('../../validations/signUp');

router.post('/', signUpValidation, signUp);

module.exports = exports = router;
