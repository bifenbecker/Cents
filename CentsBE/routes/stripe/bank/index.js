const router = require('express').Router();

const createBankAccountToken = require('./createBankAccountToken');

router.post('/token', createBankAccountToken);

module.exports = router;
