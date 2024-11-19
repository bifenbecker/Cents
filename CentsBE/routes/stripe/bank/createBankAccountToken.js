const stripe = require('../config');

async function createBankAccountToken(req, res, next) {
    try {
        const { accountHolder, routingNumber, accountNumber } = req.body;
        const token = await stripe.tokens.create({
            bank_account: {
                country: 'US',
                currency: 'usd',
                account_holder_name: accountHolder,
                account_holder_type: 'company',
                routing_number: routingNumber,
                account_number: accountNumber,
            },
        });

        return res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = createBankAccountToken;
