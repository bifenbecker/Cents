const Joi = require('@hapi/joi');

function typeValidations(req) {
    const { storeId } = req.params;
    const { startDate, serviceType, zipCode } = req.query;
    const payload = {
        storeId,
        startDate,
        serviceType,
        zipCode,
    };

    const schema = Joi.object().keys({
        storeId: Joi.number()
            .required()
            .error(() => 'storeId must be a number'),
        startDate: Joi.number().optional(),
        serviceType: Joi.string()
            .required()
            .error(() => 'serviceType must be a string'),
        zipCode: Joi.number()
            .required()
            .error(() => 'zipCode must be a number'),
    });
    return Joi.validate(payload, schema);
}

async function validateOwnDelivery(req, res, next) {
    const isValid = typeValidations(req);
    if (isValid.error) {
        res.status(422).json({
            error: isValid.error.message,
        });
        return;
    }
    next();
}

module.exports = validateOwnDelivery;
