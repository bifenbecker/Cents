const accounts = require('../../../../stripe/account/getBankAccounts');

async function getAccounts(req, res, next) {
    try {
        const { business } = req.constants;
        const { merchantId } = business;
        const savedAccounts = await accounts(merchantId);
        let bankAccounts = {};
        if (savedAccounts) {
            bankAccounts = savedAccounts.external_accounts;
        }
        res.status(200).json({
            bankAccounts,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getAccounts;
