const Joi = require('@hapi/joi');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        otp: Joi.string()
            .required()
            .length(6)
            .trim()
            .regex(new RegExp('^[0-9]+$'))
            .error(new Error('Invalid code. code must be a 6 digit number.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateRequest(req, res, next) {
    try {
        const isTypeValid = typeValidation({ otp: req.body.otp });
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
