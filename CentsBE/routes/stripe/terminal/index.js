const router = require('express').Router();

const {
    getIndividualTerminal,
    processTerminalPaymentIntent,
    cancelTerminalPayment,
} = require('./terminalController');

const processTerminalPaymentIntentValidation = require('../../../validations/stripe/terminal/processTerminalPaymentIntent');
const cancelTerminalPaymentValidation = require('../../../validations/stripe/terminal/cancelTerminalPayment');

router.get('/reader/:readerId', getIndividualTerminal);
router.post(
    '/reader/payment-intent/process',
    processTerminalPaymentIntentValidation,
    processTerminalPaymentIntent,
);
router.post(
    '/reader/payment-intent/cancel',
    cancelTerminalPaymentValidation,
    cancelTerminalPayment,
);

module.exports = router;
