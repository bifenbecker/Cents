const router = require('express').Router();

const signIn = require('./signIn');

router.post('/', signIn);

module.exports = exports = router;
