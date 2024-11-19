const router = require('express').Router();

const { updatePaymentStatementDescriptor } = require('./accountController');

const updatePaymentStatementDescriptorValidation = require('../../../validations/stripe/account/updatePaymentStatementDescriptor');

router.post(
    '/update-statement-descriptor',
    updatePaymentStatementDescriptorValidation,
    updatePaymentStatementDescriptor,
);

module.exports = router;
