function pricingTierPayload(serviceId, inventoryId) {
    return {
        type: 'COMMERCIAL',
        name: 'Tier name',
        servicePrices: [
            {
                storePrice: 23,
                isFeatured: true,
                minQty: 12,
                minPrice: 2,
                serviceId: serviceId,
                isDeliverable: true,
            }
        ],
        inventoryPrices: [
            {
                price: 12,
                isFeatured: false,
                inventoryId: inventoryId,
            }
        ]
    };
}

function pricingTierUpdatePayload(tierId, coulmnName, columnValue) {
    return {
        tierId,
        [coulmnName]: columnValue,
        field: "isFeatured",
        value: false
    };
}

module.exports = {
    pricingTierPayload,
    pricingTierUpdatePayload,
};
