const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        machineId: Joi.number().integer().min(1).required(),
    });

    return Joi.validate(inputObj, schema);
}

async function getMachinePricesSettingsValidation(req, res, next) {
    try {
        const isValid = typeValidations(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message || isValid.error.details[0].message,
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = getMachinePricesSettingsValidation;
