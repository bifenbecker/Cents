const stripe = require('../config');

async function attachAccountToken(accountId, token) {
    const linkAcount = await stripe.accounts.createExternalAccount(accountId, {
        external_account: token,
        default_for_currency: true,
    });
    return linkAcount;
}

async function attachAccountDetails(accountId, details) {
    const token = await stripe.tokens.create({
        bank_account: {
            country: 'US',
            currency: 'usd',
            ...details,
        },
    });
    const account = await attachAccountToken(accountId, token.id);
    return account;
}

module.exports = exports = {
    attachAccountToken,
    attachAccountDetails,
};
