const router = require('express').Router();

const account = require('./account');
const terminal = require('./terminal');

router.use('/account', account);
router.use('/terminal', terminal);

module.exports = exports = router;
