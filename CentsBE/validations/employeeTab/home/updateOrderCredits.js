const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        creditAmount: Joi.number().optional().allow(null),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function updateOrderCreditValidations(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        const { creditAmount } = req.body;
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        req.constants.orderCalculationAttributes.creditAmount = creditAmount;
        req.constants.isCreditApplied = creditAmount;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateOrderCreditValidations;
