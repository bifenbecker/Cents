const createPricingTierPipeline = require('../../../../pipeline/pricingTiers/createPricingTierPipeline');

const getBusiness = require('../../../../utils/getBusiness');

const createTier = async (req, res, next) => {
    try {
        const payload = req.body;
        const business = await getBusiness(req);
        const result = await createPricingTierPipeline({ ...payload, businessId: business.id });
        res.status(200).json({
            success: true,
            tierDetails: result,
        });
    } catch (error) {
        next(error);
    }
};
module.exports = exports = createTier;
