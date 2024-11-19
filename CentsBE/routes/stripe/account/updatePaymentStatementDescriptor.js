const stripe = require('../config');

/**
 * Update stripe account payment statement descriptor
 * @param {string} id
 * @param {string} value
 * @returns {Promise} Promise object represents the updated stripe account
 */
function updatePaymentStatementDescriptor(id, newValue) {
    return stripe.accounts.update(id, {
        settings: {
            payments: {
                statement_descriptor: newValue,
            },
        },
    });
}

module.exports = updatePaymentStatementDescriptor;
