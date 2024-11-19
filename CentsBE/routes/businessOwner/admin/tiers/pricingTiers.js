const listPricingTiersPipeline = require('../../../../pipeline/pricingTiers/listPricingTiersPipeline');

const listPricingTiers = async (req, res, next) => {
    try {
        const businessId = req.constants.business.id;
        const { type, keyword } = req.query;

        const payload = {
            businessId,
            type,
            keyword,
        };

        const result = await listPricingTiersPipeline(payload);
        res.status(200).json({
            success: true,
            tiers: result,
        });
    } catch (error) {
        next(error);
    }
};
module.exports = exports = listPricingTiers;
