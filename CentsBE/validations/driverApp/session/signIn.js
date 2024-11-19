const Joi = require('@hapi/joi');
const formatError = require('../../../utils/formatError');

function typeValidations(req, res, next) {
    try {
        const schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });
        const isValid = Joi.validate(req.body, schema);
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

module.exports = exports = typeValidations;
