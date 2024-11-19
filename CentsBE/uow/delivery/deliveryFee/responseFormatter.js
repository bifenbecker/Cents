function formatResponse(payload) {
    try {
        const { storeDeliverySettings, deliveryFeeInCents } = payload;
        const storeId = storeDeliverySettings?.storeId;

        if (!storeId) return {};

        return {
            ownDeliveryStore: {
                storeId,
                deliveryFeeInCents,
            },
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = formatResponse;
