const calculateRecurringDiscount = (payload) => {
    const { serviceOrderRecurringSubscription, orderItemsTotal, promotionAmount } = payload;
    let recurringDiscount = 0;
    if (serviceOrderRecurringSubscription) {
        const { recurringDiscountInPercent } = serviceOrderRecurringSubscription;
        recurringDiscount = (
            Number(orderItemsTotal - promotionAmount) *
            (Number(recurringDiscountInPercent) / 100)
        ).toFixed(2);
    }
    payload.recurringDiscount = Number(recurringDiscount);
    return payload;
};

module.exports = exports = calculateRecurringDiscount;
