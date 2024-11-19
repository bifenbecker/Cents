const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        originStoreId: Joi.number().integer().required(),
        shiftTimingId: Joi.number().integer().required(),
        driverLat: Joi.string().required().error(new Error('Driver latitude is required')),
        driverLng: Joi.string().required().error(new Error('Driver longitude is required')),
        stores: Joi.array().items(Joi.object()),
        orderDeliveryIds: Joi.array().items(Joi.number()),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function createRouteValidation(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
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

module.exports = exports = createRouteValidation;
