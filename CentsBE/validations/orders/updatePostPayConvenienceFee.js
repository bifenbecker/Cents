const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        convenienceFeeId: Joi.number().optional().allow(null),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        const { convenienceFeeId } = req.body;
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        req.constants.orderCalculationAttributes.convenienceFeeId = convenienceFeeId;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
