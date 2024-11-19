const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        hasAppReportingAccessible: Joi.boolean().required(),
        id: Joi.number().integer().required(),
    });

    return Joi.validate(inputObj, schema);
}

async function validateReportingAcessible(req, res, next) {
    try {
        const isValid = typeValidations({ ...req.body, id: req.params.id });

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

module.exports = validateReportingAcessible;
