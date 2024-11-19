require('dotenv').config();

const router = require('express').Router();

// Controllers
const getPaymentMethods = require('./getPaymentMethods');
const {
    fillBalanceValidation,
} = require('../../../../validations/liveLink/customer/payments/fillBalanceValidation');
const fillBalance = require('./fillBalance');
const centsCustomerAuthToken = require('../../../../middlewares/liveLink/centsCustomerAuthToken');

router.get('/:centsCustomerId/payment-methods', getPaymentMethods);
router.post('/fill-balance', centsCustomerAuthToken, fillBalanceValidation, fillBalance);

module.exports = exports = router;
