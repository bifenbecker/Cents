const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        routing_number: Joi.string()
            .required()
            .min(9)
            .trim()
            .error(
                new Error(
                    'Invalid routing number. Routing number must be at least 9 characters long.',
                ),
            ),
        account_number: Joi.string()
            .required()
            .min(12)
            .trim()
            .error(
                new Error(
                    'Invalid account number. Account number must be at least 12 characters long.',
                ),
            ),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

function validateRequest(req, res, next) {
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

module.exports = exports = validateRequest;
