const updateTierDeliverableServicesPipeline = require('../../../../pipeline/pricingTiers/updateTierDeliverableServicesPipeline');

const updateTierDeliverableServices = async (req, res, next) => {
    try {
        await updateTierDeliverableServicesPipeline(req.body);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
module.exports = exports = updateTierDeliverableServices;
