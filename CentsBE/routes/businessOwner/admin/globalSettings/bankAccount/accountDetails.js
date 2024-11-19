const accountDetails = require('../../../../stripe/account/getBankAccounts');
const getBusiness = require('../../../../../utils/getBusiness');

async function getAccountDetails(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { merchantId } = business;
        if (!merchantId) {
            res.status(200).json({
                success: true,
                details: null,
            });
            return;
        }
        const details = await accountDetails(merchantId);
        res.status(200).json({
            success: true,
            details,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getAccountDetails;
