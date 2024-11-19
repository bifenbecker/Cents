const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        zipcode: Joi.number().integer().required(),
        storeId: Joi.number().integer().required(),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: 'Please enter a valid zip code',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
