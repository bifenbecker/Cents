const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        timeZone: Joi.string().required(),
        allStoresCheck: Joi.string().optional(),
        stores: Joi.when('allStoresCheck', {
            is: 'true',
            then: Joi.allow(null).optional(),
            otherwise: Joi.alternatives().try(Joi.string(), Joi.array()).required().allow(null, ''),
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateSalesByServiceSubCategoryPayload(req, res, next) {
    try {
        const isValid = typeValidations(req.query);
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

module.exports = exports = validateSalesByServiceSubCategoryPayload;
