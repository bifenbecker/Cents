const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        linkType: Joi.string().valid('onboarding', 'update').required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.query);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
