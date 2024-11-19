const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        serviceId: Joi.number().integer().required().min(1),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validations(req, res, next) {
    try {
        const { serviceId } = req.params;
        const isValid = typeValidations({ serviceId });
        if (isValid.error) {
            res.status(422).json({
                error: formatError(isValid.error),
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validations;
