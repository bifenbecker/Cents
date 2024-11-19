const detachAccount = require('../../../../stripe/account/deleteAccount');

async function deleteAccount(req, res, next) {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(422).json({
                error: 'Id is required.',
            });
            return;
        }
        const { merchantId } = req.constants.business;
        await detachAccount(id, merchantId);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({
                error: error.message,
            });
            return;
        }
        next(error);
    }
}

module.exports = exports = deleteAccount;
