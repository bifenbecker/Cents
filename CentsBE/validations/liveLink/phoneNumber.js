const Joi = require('@hapi/joi');

function typeValidation(input) {
    const schema = Joi.object().keys({
        phoneNumber: Joi.string()
            .trim()
            .length(10)
            .regex(new RegExp('^[0-9]+$'))
            .error(new Error('Phone number is required. Phone number must have 10 digits.'))
            .required(),
        storeId: Joi.number().optional().allow(null, ''),
    });

    const validate = Joi.validate(input, schema);
    return validate;
}

function isTypeValid(req, res, next) {
    try {
        const isValid = typeValidation({ phoneNumber: req.body.phoneNumber });
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

module.exports = exports = isTypeValid;
