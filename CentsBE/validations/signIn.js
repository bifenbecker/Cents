const Joi = require('@hapi/joi');

function signInValidation(inputs) {
    const validationSchema = Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    });

    const inputObject = {
        email: inputs.username,
        password: inputs.password,
    };

    const error = Joi.validate(inputObject, validationSchema);

    return error;
}

module.exports = exports = signInValidation;
