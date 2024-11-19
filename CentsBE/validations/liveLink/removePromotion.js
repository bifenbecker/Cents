async function validateRemovePromotion(req, res, next) {
    try {
        const {
            balanceDue,
            promotionId,
            paymentStatus,
            orderType,
            previousTipOption: tipOption,
        } = req.constants.order;
        req.body.isPromoRemoved = true;
        if (!promotionId) {
            res.status(409).json({
                error: 'Promotion can not be removed as it was previously not applied.',
            });
            return;
        }

        if ((balanceDue === 0 || paymentStatus === 'PAID') && orderType !== 'ONLINE') {
            res.status(409).json({
                error: 'Promotion can not be updated for a paid order.',
            });
            return;
        }
        req.constants.orderCalculationAttributes.promotionId = null;
        let tipAmount = tipOption;
        if (tipOption && tipOption.includes('$')) {
            tipAmount = Number(tipOption.replace('$', ''));
        }
        req.constants.orderCalculationAttributes.tipAmount = tipAmount;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRemovePromotion;
