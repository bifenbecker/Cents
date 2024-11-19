const {
    attachAccountToken,
    attachAccountDetails,
} = require('../../../../stripe/account/addBankAccount');

async function addAccountToken(req, res, next) {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(422).json({
                error: 'Token is required to add bank account.',
            });
            return;
        }
        const { business } = req.constants;
        const account = await attachAccountToken(business.merchantId, token);
        res.status(200).json({
            success: true,
            bankAccount: account,
        });
    } catch (error) {
        next(error);
    }
}

async function addAccountDetails(req, res, next) {
    try {
        const { business } = req.constants;
        const account = await attachAccountDetails(business.merchantId, req.body);
        res.status(200).json({
            success: true,
            bankAccount: account,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = { addAccountToken, addAccountDetails };
