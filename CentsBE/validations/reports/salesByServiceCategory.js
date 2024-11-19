const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');
const timeRangeSchema = require('./timeRangeSchema');
const storesSchema = require('./storesSchema');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        ...timeRangeSchema,
        ...storesSchema,
        status: Joi.string().required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateSalesByServiceCategoryPayload(req, res, next) {
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

module.exports = exports = validateSalesByServiceCategoryPayload;
