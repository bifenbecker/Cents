const getBusiness = require('../../../utils/getBusiness');

async function hasMerchantId(req, res, next) {
    try {
        const business = await getBusiness(req);
        const { merchantId } = business;
        if (!merchantId) {
            res.status(409).json({
                error: 'Your business is not registered with stripe. Please register with our payments partner.',
            });
            return;
        }
        req.constants = req.constants || {};
        req.constants.business = business;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = hasMerchantId;
