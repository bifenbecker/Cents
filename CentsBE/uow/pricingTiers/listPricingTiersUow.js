const PricingTier = require('../../models/pricingTier');

const listPricingTiersUow = async (payload) => {
    let tiers;

    tiers = PricingTier.query()
        .select('id', 'name', 'offerDryCleaningForDeliveryTier')
        .where('businessId', payload.businessId)
        .andWhere('deletedAt', null)
        .andWhere('type', payload.type)
        .orderBy('name');
    if (payload.keyword) {
        tiers = tiers.andWhere('name', 'ILIKE', `%${payload.keyword}%`);
    }
    payload.tiers = await tiers;
    return payload;
};
module.exports = exports = listPricingTiersUow;
