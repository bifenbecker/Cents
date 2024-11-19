const Joi = require('@hapi/joi');
const formatError = require('../../../../utils/formatError');

function isValid(req, res, next) {
    try {
        const schema = Joi.object().keys({
            employeeCode: Joi.number().integer().required(),
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

module.exports = exports = isValid;
