const stripe = require('../config');

async function generateLink(accountId, linkType) {
    const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: process.env.REFRESH_URL,
        return_url: process.env.RETURN_URL,
        type: linkType === 'onboarding' ? 'account_onboarding' : 'account_update',
        collect: 'eventually_due',
    });
    return link;
}

module.exports = exports = generateLink;
