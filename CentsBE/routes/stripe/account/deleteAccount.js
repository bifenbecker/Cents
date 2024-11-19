const stripe = require('../config');

async function deleteAccount(id, accountId) {
    await stripe.accounts.deleteExternalAccount(accountId, id);
}

module.exports = exports = deleteAccount;
