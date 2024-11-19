const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        overriddenScan: Joi.boolean().required(),
        type: Joi.string().valid(['PICKUP', 'RETURN']).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function completeStoreServiceOrderValidation(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
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

module.exports = exports = completeStoreServiceOrderValidation;
