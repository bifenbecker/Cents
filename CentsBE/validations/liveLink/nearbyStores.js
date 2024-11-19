const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        businessId: Joi.number()
            .integer()
            .required()
            .error(new Error('Business Id greater than 0 is required.')),
        googlePlacesId: Joi.string()
            .trim()
            .required()
            .error(new Error('Google places id is required.')),
        timeZone: Joi.string().trim().required().error(new Error('Time zone is required.')),
        lat: Joi.number().required().error(new Error('Lat is required.')),
        lng: Joi.number().required().error(new Error('Lng is required')),
        zipCode: Joi.number().required().error(new Error('Zip code is required.')),
        type: Joi.string().allow('', null).optional(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateRequest(req, res, next) {
    try {
        const isTypeValid = typeValidations(req.query);
        if (isTypeValid.error) {
            res.status(422).json({
                error: isTypeValid.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
