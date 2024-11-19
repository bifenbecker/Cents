const Joi = require('@hapi/joi');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.string()
            .regex(new RegExp('^[0-9]+$'))
            .required()
            .error(new Error('id must be a positive integer.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ id });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        if (id < 1) {
            res.status(422).json({
                error: 'id must be greater than equal to 1',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
