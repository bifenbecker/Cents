async function buildOrderItemsForUpdate(payload) {
    const { serviceOrderItems } = payload;
    const updatedOrderItems = serviceOrderItems.map((item) => ({
        id: item.orderItemId,
        promotionAmountInCents: item.promotionAmountInCents,
        taxAmountInCents: item.taxAmountInCents,
    }));
    payload.serviceOrderItems = updatedOrderItems;
    return payload;
}
module.exports = exports = buildOrderItemsForUpdate;
