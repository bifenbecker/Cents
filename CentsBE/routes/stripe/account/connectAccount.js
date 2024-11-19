const stripe = require('../config');

async function connectAccount() {
    const stripeAccount = await stripe.accounts.create({
        type: 'custom', // hardcoding for now.
        country: 'US', // hardcoding for now.
        capabilities: {
            card_payments: { requested: true }, // hardcoding for now.
            transfers: { requested: true }, // hardcoding for now.
        },
    });
    return stripeAccount;
}

module.exports = exports = connectAccount;
