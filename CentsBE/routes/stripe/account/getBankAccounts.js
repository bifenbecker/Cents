const stripe = require('../config');

async function getAccounts(accountId) {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
}

module.exports = exports = getAccounts;
