async function validateRemoveCredits(req, res, next) {
    try {
        const { balanceDue, creditAmount, paymentStatus, orderType } = req.constants.order;

        req.body.isCreditRemoved = true;

        if (!creditAmount) {
            res.status(409).json({
                error: 'Can not remove credits as it was not applied.',
            });
            return;
        }
        if ((balanceDue === 0 || paymentStatus === 'PAID') && orderType !== 'ONLINE') {
            res.status(409).json({
                error: 'Credits can not be updated for a paid order.',
            });
            return;
        }
        req.constants.orderCalculationAttributes.creditAmount = 0;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRemoveCredits;
