const Joi = require('@hapi/joi');

function typeValidations(req) {
    const validationSchema = Joi.object().keys({
        prices: Joi.array().required(),
    });
    const validate = Joi.validate(req, validationSchema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const isTypeValid = typeValidations(req.body);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message.includes('"prices" is required')
                    ? 'Service prices are required to update the deliverable status'
                    : isTypeValid.error.message,
            });
        }
        next();
    } catch (e) {
        next(e);
    }
}

module.exports = validate;
