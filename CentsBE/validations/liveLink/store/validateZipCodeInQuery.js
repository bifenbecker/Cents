const Joi = require('@hapi/joi');

function typeValidations(zipCode) {
    return Joi.validate(
        zipCode,
        Joi.string()
            .required()
            .error(() => 'zipCode is required.'),
    );
}

async function validateZipCodeInQuery(req, res, next) {
    const { zipCode } = req.query;

    const isValid = typeValidations(zipCode);
    if (isValid.error) {
        res.status(422).json({
            error: isValid.error.message,
        });
        return;
    }
    next();
}

module.exports = validateZipCodeInQuery;
