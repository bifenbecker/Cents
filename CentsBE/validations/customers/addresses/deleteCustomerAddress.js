const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().required('centsCustomerAddress id is required'),
    });

    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateForRequestWithParams(req, res, next) {
    const { id } = req.params;
    const isValid = typeValidations({ id });
    if (isValid.error) {
        res.status(422).json({
            error: isValid.error.message,
        });
        return;
    }
    next();
}

module.exports = exports = { validateForRequestWithParams };
