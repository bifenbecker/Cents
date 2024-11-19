const validateTierPipeline = require('../../../../pipeline/pricingTiers/validateTierPipeline');

const getBusiness = require('../../../../utils/getBusiness');

const validateTier = async (req, res, next) => {
    try {
        const business = await getBusiness(req);
        const { name, type } = req.body;

        const result = await validateTierPipeline({ name, type, businessId: business.id });
        res.status(200).json({
            success: result,
        });
    } catch (error) {
        next(error);
    }
};
module.exports = exports = validateTier;
