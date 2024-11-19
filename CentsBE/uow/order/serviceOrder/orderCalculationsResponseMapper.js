function orderItemsResponseMapper(serviceOrderItems, orderItems) {
    return orderItems
        .filter((item) => !item.isDeleted)
        .map((orderItem) => {
            const { priceId, lineItemType, count, weight, id } = orderItem;
            const itemRes = {
                priceId,
                lineItemType,
                count,
                weight,
                id,
            };
            let serviceOrderItem;
            if (
                orderItem.lineItemType === 'INVENTORY' ||
                (orderItem.lineItemType === 'SERVICE' && !orderItem.serviceModifierIds)
            ) {
                serviceOrderItem = serviceOrderItems.find(
                    (serviceOrderItem) => serviceOrderItem.priceId === orderItem.priceId,
                );
            } else {
                serviceOrderItem = serviceOrderItems.find(
                    (serviceOrderItem) =>
                        serviceOrderItem.priceId === orderItem.priceId &&
                        serviceOrderItem.id === orderItem.id,
                );
            }
            if (serviceOrderItem) {
                itemRes.totalAmount = Number(serviceOrderItem.totalPrice).toFixed(2);
                itemRes.promotionAmount = Number(
                    (serviceOrderItem.promotionAmountInCents / 100).toFixed(2),
                );
                itemRes.taxAmount = Number((serviceOrderItem.taxAmountInCents / 100).toFixed(2));
                itemRes.lineItemName = serviceOrderItem.lineItemName;
                itemRes.price = Number(serviceOrderItem.perItemPrice).toFixed(2);
                itemRes.minimumPrice = serviceOrderItem.minimumPrice;
                itemRes.minimumQuantity = serviceOrderItem.minimumQuantity;
                itemRes.category = serviceOrderItem.category;
                itemRes.hasMinPrice = serviceOrderItem.hasMinPrice;
                itemRes.pricingType = serviceOrderItem?.pricingType;
                itemRes.orderItemId = serviceOrderItem?.orderItemId;
            }
            if (orderItem.serviceModifierIds) {
                itemRes.modifiers = orderItem.serviceModifierIds.map((serviceModifierId) => {
                    const modifier = serviceOrderItems.find(
                        (serviceOrderItem) =>
                            serviceOrderItem.serviceModifierId === serviceModifierId &&
                            serviceOrderItem.lineItemType === 'MODIFIER',
                    );
                    return {
                        serviceModifierId,
                        name: modifier?.name,
                        price: modifier?.perItemPrice,
                        modifierName: modifier?.name,
                        unitCost: modifier?.price,
                        totalCost: Number(Number(modifier?.price) * Number(count)),
                        quantity: Number(count),
                    };
                });
                itemRes.modifierLineItems = itemRes.modifiers;
            }
            return itemRes;
        });
}

function orderCalculationsResponse(payload) {
    const {
        taxAmountInCents = 0,
        serviceOrder = {},
        promotionAmount = 0,
        balanceDue = 0,
        creditAmount = 0,
        tipAmount = 0,
        pickupDeliveryFee = 0,
        pickupDeliveryTip = 0,
        returnDeliveryFee = 0,
        returnDeliveryTip = 0,
        convenienceFee = 0,
        promotionDetails,
        serviceOrderItems,
        netOrderTotal = 0,
        orderItems,
        totalPaid,
        orderTotal = 0,
        isTaxable = false,
        serviceOrderRecurringSubscription,
        recurringDiscountInCents,
    } = payload;

    const response = {
        orderId: serviceOrder.id,
        taxAmount: taxAmountInCents / 100 === null ? 0 : taxAmountInCents / 100,
        promotionAmount: promotionAmount === null ? 0 : promotionAmount,
        netOrderTotal: netOrderTotal === null ? 0 : netOrderTotal,
        orderTotal: orderTotal === null ? 0 : orderTotal,
        balanceDue: balanceDue === null ? 0 : balanceDue,
        creditAmount: creditAmount === null ? 0 : creditAmount,
        tipAmount: tipAmount === null ? 0 : tipAmount,
        pickupDeliveryFee: pickupDeliveryFee === null ? 0 : pickupDeliveryFee,
        pickupDeliveryTip: pickupDeliveryTip === null ? 0 : pickupDeliveryTip,
        returnDeliveryFee: returnDeliveryFee === null ? 0 : returnDeliveryFee,
        returnDeliveryTip: returnDeliveryTip === null ? 0 : returnDeliveryTip,
        totalPaid: totalPaid === null ? 0 : totalPaid,
        convenienceFee: convenienceFee === null ? 0 : convenienceFee,
        promotion: promotionDetails ? { ...promotionDetails.promoDetails } : null,
        orderItems: orderItemsResponseMapper(serviceOrderItems, orderItems),
        isTaxable,
        subscription: serviceOrderRecurringSubscription,
        recurringDiscountInCents,
    };

    return response;
}
module.exports = exports = orderCalculationsResponse;
