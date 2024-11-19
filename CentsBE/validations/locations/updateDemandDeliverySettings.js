const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        returnOnlySubsidyInCents: Joi.number().integer().min(0).optional(),
        subsidyInCents: Joi.number().integer().min(0).optional(),
        active: Joi.boolean().optional(),
        storeId: Joi.number().integer().min(1).required(),
    });
    const inputObject = {
        subsidyInCents: inputObj.subsidyInCents,
        storeId: inputObj.storeId,
        returnOnlySubsidyInCents: inputObj.returnOnlySubsidyInCents,
    };
    const error = Joi.validate(inputObject, schema);
    return error;
}

async function validateDemandDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        const isValid = typeValidations({ ...req.body, storeId });
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

module.exports = exports = validateDemandDeliverySettings;
