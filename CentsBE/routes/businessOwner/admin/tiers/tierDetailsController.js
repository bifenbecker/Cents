const tierDetailsPipeline = require('../../../../pipeline/pricingTiers/getTierDetails');

const tierDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tier } = await tierDetailsPipeline({ id });
        res.status(200).json({
            success: true,
            tier,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    tierDetails,
};
