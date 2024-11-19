const Joi = require('@hapi/joi');

function typeValidations(req) {
    // TODO - Add more fields if validation required
    const validationSchema = Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().required(),
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
