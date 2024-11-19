const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        promotionId: Joi.number().optional().allow(null),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function updateOrderPromotionValidations(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        const { promotionId } = req.body;
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        req.constants.orderCalculationAttributes.promotionId = promotionId;
        req.constants.orderCalculationAttributes.creditAmount = promotionId
            ? 0
            : req.constants.orderCalculationAttributes.creditAmount;
        req.constants.isPromoApplied = promotionId;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateOrderPromotionValidations;
