const Joi = require('@hapi/joi');
const { joiValidationCommonErrHandler } = require('../validationUtil');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        userId: Joi.number().required().error(joiValidationCommonErrHandler),
        allStoresCheck: Joi.string().optional(),
        stores: Joi.when('allStoresCheck', {
            is: 'true',
            then: Joi.any().optional().allow(null).error(joiValidationCommonErrHandler),
            otherwise: Joi.array().required().error(joiValidationCommonErrHandler),
        }),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateSubscriptionsReportPayload(req, res, next) {
    try {
        const isValid = typeValidations(req.query);
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

module.exports = exports = validateSubscriptionsReportPayload;
