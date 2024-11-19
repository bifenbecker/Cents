const router = require('express').Router();

const createPayment = require('./createPayment');
const updatePayment = require('./updatePayment');

router.post('/create', createPayment);
router.post('/update', updatePayment);

module.exports = exports = router;
