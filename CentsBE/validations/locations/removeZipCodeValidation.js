const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        zipCodes: Joi.array()
            .items(Joi.string())
            .min(1)
            .required()
            .error(new Error('Zip codes are required')),
        storeId: Joi.number().integer().required().error(new Error('StoreId is required.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function removeZipCodeValidation(req, res, next) {
    try {
        const { zipCodes } = req.body;
        const { storeId } = req.params;
        const isValid = typeValidations({ zipCodes, storeId });
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

module.exports = exports = removeZipCodeValidation;
