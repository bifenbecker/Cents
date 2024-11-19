const router = require('express').Router();

const phone = require('./phone');
const address = require('./address');
const payment = require('./payment');
const verifyPhone = require('./verifyPhone');
const createCustomer = require('./createCustomer');
const notes = require('./notes');

const createCustomerValidator = require('../../../validations/liveLink/customer/add');

router.use('/phone', phone);
router.use('/address', address);
router.use('/payment', payment);
router.use('/notes', notes);
router.get('/verify', verifyPhone);
router.post('/', createCustomerValidator, createCustomer);

module.exports = exports = router;
