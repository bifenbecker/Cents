const PricingTier = require('../../models/pricingTier');

const validateTierUOW = async (payload) => {
    try {
        const { name, type, businessId, transaction } = payload;
        const tiers = await PricingTier.query(transaction)
            .select('name')
            .whereRaw('lower(name) = ?', [name.toLowerCase()])
            .andWhere('type', type)
            .andWhere('businessId', businessId)
            .whereNull('deletedAt');
        return !tiers.length;
    } catch (error) {
        return error;
    }
};
module.exports = exports = validateTierUOW;
