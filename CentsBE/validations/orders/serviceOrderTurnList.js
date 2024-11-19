const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        serviceOrderId: Joi.number().integer().min(1).required(),
        type: Joi.string().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateRequest(req, res, next) {
    try {
        const { serviceOrderId } = req.params;
        const { type } = req.query;
        const isValid = typeValidations({ serviceOrderId, type });
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
