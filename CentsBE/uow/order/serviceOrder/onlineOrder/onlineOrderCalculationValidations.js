async function onlineOrderCalculationValidations(payload) {
    const {
        promotionAmount,
        creditAmount,
        serviceOrder,
        isLiveLinkRequest = false,
        isPromoApplied,
        isCreditApplied,
    } = payload;
    if (!isLiveLinkRequest) {
        return payload;
    }
    if (serviceOrder.netOrderTotal < 0) {
        if (isPromoApplied) {
            if (creditAmount) {
                throw new Error('UNABLE_TO_APPLY_PROMOTION_DUE_TO_CREDIT');
            }
            throw new Error('UNABLE_TO_APPLY_PROMOTION');
        }
        if (isCreditApplied) {
            throw new Error('UNABLE_TO_APPLY_CREDITS');
        }
    }
    if (serviceOrder.balanceDue < promotionAmount && isPromoApplied) {
        throw new Error('UNABLE_TO_APPLY_PROMOTION_DUE_TO_BALANCE_DUE');
    }

    return payload;
}

module.exports = exports = onlineOrderCalculationValidations;
