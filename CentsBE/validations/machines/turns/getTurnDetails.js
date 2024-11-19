const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        turnId: Joi.number().integer().required().min(1),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}
async function validateRequest(req, res, next) {
    try {
        const { turnId } = req.params;
        const isValid = typeValidations({ turnId });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
