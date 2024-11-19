const router = require('express').Router();

// Controller methods
const {
    refundStripePayment,
    refundCashPayment,
} = require('../../superAdmin/payments/paymentsController');

// Validators
const refundPaymentValidation = require('../../../validations/superAdmin/payments/refundPayment');

router.put('/:id/cash/refund', refundPaymentValidation, refundCashPayment);
router.put('/:id/stripe/refund', refundPaymentValidation, refundStripePayment);

module.exports = exports = router;
