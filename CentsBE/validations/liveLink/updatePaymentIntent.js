const Joi = require('@hapi/joi');

function typeValidation(inputObj) {
    const schema = Joi.object().keys({
        paymentToken: Joi.string().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validate(req, res, next) {
    try {
        const isTypeValid = typeValidation(req.body);
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

module.exports = exports = validate;
