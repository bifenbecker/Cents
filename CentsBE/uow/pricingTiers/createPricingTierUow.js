const PricingTier = require('../../models/pricingTier');

const createPricingTierUow = async (payload) => {
    try {
        const {
            name,
            type,
            businessId,
            transaction,
            commercialDeliveryFeeInCents,
            offerDryCleaningForDeliveryTier,
        } = payload;
        const tier = await PricingTier.query(transaction)
            .insert({
                name,
                type,
                businessId,
                commercialDeliveryFeeInCents,
                offerDryCleaningForDeliveryTier,
                createdAt: new Date().toISOString(),
            })
            .returning('*');
        return {
            ...payload,
            id: tier.id,
        };
    } catch (error) {
        throw Error(error.message);
    }
};
module.exports = exports = createPricingTierUow;
