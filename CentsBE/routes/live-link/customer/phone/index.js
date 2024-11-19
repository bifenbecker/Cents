require('dotenv').config();

const router = require('express').Router();

// Controllers
const updateCustomerPhone = require('./updatePhoneNumber');

router.patch('/update', updateCustomerPhone);

module.exports = exports = router;
