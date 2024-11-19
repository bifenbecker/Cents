const Joi = require('@hapi/joi');

function typeValidations(req) {
    const validationSchema = Joi.object().keys({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        phoneNumber: Joi.string().required().min(1).max(16),
        languageId: Joi.number().integer().optional(),
    });
    const validate = Joi.validate(req, validationSchema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const isTypeValid = typeValidations(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
        }
        next();
    } catch (e) {
        next(e);
    }
}

module.exports = validate;
