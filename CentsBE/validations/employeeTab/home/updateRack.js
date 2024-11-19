const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        rack: Joi.string().required().allow('', null),
        id: Joi.number().integer().min(1).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validation(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
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

module.exports = exports = validation;
