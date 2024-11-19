const Joi = require('@hapi/joi');

function deviceListingValidation(inputs) {
    const validationSchema = Joi.object().keys({
        businessId: Joi.number().integer().required(),
    });

    const inputObject = {
        businessId: inputs.businessId,
    };

    const error = Joi.validate(inputObject, validationSchema);

    return error;
}

module.exports = exports = deviceListingValidation;
