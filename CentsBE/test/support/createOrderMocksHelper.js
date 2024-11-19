const createServiceOrderItemMock = ({
    priceId = 0,
    totalPrice = 0,
    promotionAmountInCents = 0,
    taxAmountInCents = 0,
    lineItemName = 'lineItemName',
    perItemPrice = 0,
    minimumPrice = 0,
    minimumQuantity = 0,
    category = 'CATEGORY',
    hasMinPrice = false,
    serviceModifierId = 0,
    lineItemType = 'MODIFIER',
    price = 0,
    modifier = {},
}) => {
    return {
        price,
        priceId,
        totalPrice,
        promotionAmountInCents,
        taxAmountInCents,
        lineItemName,
        perItemPrice,
        minimumPrice,
        minimumQuantity,
        category,
        hasMinPrice,
        serviceModifierId,
        lineItemType,
        modifierName: modifier?.name,
        unitCost: modifier?.price,
        quantity: modifier?.count,
        name: modifier?.name,
    };
}

const createOrderItemMock = ({
    priceId = 0,
    count = 1,
    weight = 1,
    serviceModifierIds = null,
    lineItemType = 'SERVICE',
    category = 'FIXED_PRICE',
    hasMinPrice = true,
    perItemPrice = 10,
    pricingType = 'FIXED_PRICE',
    orderItemId = null,
}) => {
    return {
        priceId,
        count,
        weight,
        serviceModifierIds,
        lineItemType,
        category,
        hasMinPrice,
        perItemPrice,
        pricingType,
        orderItemId,
    }
}

module.exports = {
    createOrderItemMock,
    createServiceOrderItemMock,
}
