const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        driverLat: Joi.string().required().error(new Error('Driver latitude is required')),
        driverLng: Joi.string().required().error(new Error('Driver longitude is required')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function updateETAForRouteDeliveryValidation(req, res, next) {
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

module.exports = exports = updateETAForRouteDeliveryValidation;
