const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        value: Joi.string().required().min(5).max(22),
    });

    return Joi.validate(inputObj, schema);
}

function validateRequest(req, res, next) {
    try {
        const { error } = typeValidations(req.body);

        if (error) {
            res.status(422).json({
                error: error.message,
            });

            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validateRequest;
