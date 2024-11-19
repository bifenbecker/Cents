const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        taxRateId: Joi.number().min(1).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateTaxRequest(req, res, next) {
    try {
        const {
            currentStore: { taxRateId },
        } = req;

        const isValid = typeValidations({ taxRateId });
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

module.exports = exports = validateTaxRequest;
