const PricingTier = require('../../models/pricingTier');
const permittedParams = require('../../utils/permittedParams');

const updateTierUow = async (payload) => {
    try {
        const { id, transaction } = payload;

        const tierDetailsPayload = permittedParams(payload, [
            'name',
            'commercialDeliveryFeeInCents',
        ]);

        await PricingTier.query(transaction).patch(tierDetailsPayload).findById(id);

        return payload;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = updateTierUow;
