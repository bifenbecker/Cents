const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        tipAmount: Joi.number().optional().allow(null),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function updateOrderTipValidations(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        const { tipAmount } = req.body;
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        req.constants.orderCalculationAttributes.tipAmount = Number(tipAmount);
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateOrderTipValidations;
