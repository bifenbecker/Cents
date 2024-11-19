const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        phoneNumber: Joi.string().required().min(1).max(16),
        subsidiaryCode: Joi.number().optional().allow(null, ''),
        storeId: Joi.number().integer().required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validations(req, res, next) {
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

module.exports = validations;
