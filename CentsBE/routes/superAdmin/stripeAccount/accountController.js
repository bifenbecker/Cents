const updateStripeAccountPaymentStatementDescriptor = require('../../stripe/account/updatePaymentStatementDescriptor');

/**
 * Update stripe payment statement descriptor
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updatePaymentStatementDescriptor({ body: { id, value } }, res, next) {
    try {
        const updatedAccount = await updateStripeAccountPaymentStatementDescriptor(id, value);

        return res.json({
            success: true,
            statementDescriptor: updatedAccount?.settings.payments.statement_descriptor,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    updatePaymentStatementDescriptor,
};
