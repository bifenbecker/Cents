const CentsCustomer = require('../../models/centsCustomer');

async function getCustomerPricingTier(payload) {
    try {
        if (!payload.currentCustomer) return payload;

        const { currentCustomer, transaction } = payload;

        const pricingTier = await CentsCustomer.query(transaction)
            .select('businessCustomers:commercialTier.*')
            .leftJoinRelated('businessCustomers.commercialTier')
            .whereNull('businessCustomers.deletedAt')
            .findById(currentCustomer.id);

        return {
            ...payload,
            pricingTier,
        };
    } catch (error) {
        throw Error(error);
    }
}

module.exports = exports = getCustomerPricingTier;
