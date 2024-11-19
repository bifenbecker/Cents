const generateLink = require('../../../../stripe/account/verificationLink');

async function getLink(req, res, next) {
    try {
        const { linkType } = req.query;
        const { business } = req.constants;
        const link = await generateLink(business.merchantId, linkType);
        res.status(200).json({
            success: true,
            link,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getLink;
