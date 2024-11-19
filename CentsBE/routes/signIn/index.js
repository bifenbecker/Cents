const router = require('express').Router();

const signIn = require('./signIn');
const reset = require('./resetPassword');
const forgot = require('./forgot');
const verify = require('./verifyToken');

router.post('/', signIn);
router.get('/reset', verify);
router.post('/forgot', forgot);
router.post('/reset', reset);

module.exports = exports = router;
