const LaundromatBusiness = require('../../../../../models/laundromatBusiness');

const getBusiness = require('../../../../../utils/getBusiness');

const createConnectAccount = require('../../../../stripe/account/connectAccount');

async function createAccount(req, res, next) {
    try {
        const business = await getBusiness(req);
        if (business.merchantId) {
            res.status(409).json({
                error: 'You are already registered with stripe.',
            });
            return;
        }
        const connectedAccount = await createConnectAccount();
        await LaundromatBusiness.query()
            .patch({
                merchantId: connectedAccount.id,
            })
            .findById(business.id);
        res.status(200).json({
            success: true,
            account: connectedAccount,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createAccount;
