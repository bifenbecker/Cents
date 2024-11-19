const router = require('express').Router();
const authenticate = require('./authenticate');

router.post('/auth', authenticate);

module.exports = exports = router;
