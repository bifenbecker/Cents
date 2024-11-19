const PricingTier = require('../models/pricingTier');

async function getPricingTierDetails(id, businessId) {
    const pricingTier = await PricingTier.query().findOne({
        id,
        businessId,
    });
    return pricingTier;
}
module.exports = exports = getPricingTierDetails;
