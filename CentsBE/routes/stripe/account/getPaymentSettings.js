const getBankAccount = require('./getBankAccounts');

/**
 * Get bank account payment settings by id
 * @param {string} accountId
 * @returns {Object|undefined}
 */
async function getPaymentSettings(accountId) {
    const account = await getBankAccount(accountId);

    return account?.settings.payments;
}

module.exports = getPaymentSettings;
