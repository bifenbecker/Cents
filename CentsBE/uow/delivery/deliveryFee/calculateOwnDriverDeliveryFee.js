function calculateOwnDriverDeliveryFee(payload) {
    try {
        const { storeDeliverySettings, pricingTier, pickup, orderId } = payload;

        const { deliveryFeeInCents, returnDeliveryFeeInCents } = storeDeliverySettings || {};

        const newPayload = payload;

        if (pricingTier && pricingTier.commercialDeliveryFeeInCents !== null) {
            // commercial delivery fee could be 0
            newPayload.deliveryFeeInCents = Math.ceil(pricingTier.commercialDeliveryFeeInCents / 2);
        } else if (
            orderId &&
            (!pickup || !pickup.deliveryProvider) &&
            returnDeliveryFeeInCents !== null
        ) {
            // if pickup.provider is not defined, it must be a return-only delivery order
            newPayload.deliveryFeeInCents = returnDeliveryFeeInCents;
        } else {
            newPayload.deliveryFeeInCents = Math.ceil(deliveryFeeInCents / 2);
        }

        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = calculateOwnDriverDeliveryFee;
