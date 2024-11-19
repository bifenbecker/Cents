const updateTierPipeline = require('../../../../pipeline/pricingTiers/updateTier');

const updateTier = async (req, res, next) => {
    try {
        const { id } = req.params;
        await updateTierPipeline({ id, ...req.body });
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports = updateTier;
