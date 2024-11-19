const router = require('express').Router();

// Controller methods
const {
    capturePendingStripePayment,
    getPaymentDetails,
    getPayments,
    refundCashPayment,
    refundStripePayment,
} = require('./paymentsController');

// Validators
const refundPaymentValidation = require('../../../validations/superAdmin/payments/refundPayment');
const capturePendingPaymentValidation = require('../../../validations/superAdmin/payments/capturePendingPayment');

router.get('/', getPayments);
router.get('/:id', getPaymentDetails);
router.put('/:id/cash/refund', refundPaymentValidation, refundCashPayment);
router.put('/:id/stripe/refund', refundPaymentValidation, refundStripePayment);
router.put('/:id/stripe/capture', capturePendingPaymentValidation, capturePendingStripePayment);

module.exports = exports = router;
