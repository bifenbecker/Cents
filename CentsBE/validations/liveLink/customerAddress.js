const Joi = require('@hapi/joi');

function typeValidation(input) {
    const schema = Joi.object().keys({
        address1: Joi.string().trim().required().error(new Error('Address 1 is required.')),
        address2: Joi.string().optional().allow('', null),
        city: Joi.string().trim().required().error(new Error('City is required.')),
        firstLevelSubdivisionCode: Joi.string()
            .trim()
            .error(new Error('First Level Subdivision Code is required')),
        postalCode: Joi.string().trim().required().error(new Error('Postal Code is required')),
        countryCode: Joi.string().required().error(new Error('Country Code is required')),
        instructions: Joi.string().optional().allow('', null),
        leaveAtDoor: Joi.boolean().optional().allow('', null),
    });

    const validate = Joi.validate(input, schema);
    return validate;
}

function isTypeValid(req, res, next) {
    try {
        const isValid = typeValidation(req.body);
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

module.exports = exports = isTypeValid;
