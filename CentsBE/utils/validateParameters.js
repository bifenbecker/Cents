const Joi = require('@hapi/joi');
const formatError = require('./formatError');

/**
 * Validate request parameters based on validation scheme
 *
 * @param {Object} schema
 * @param {Object} getParams
 * @returns {Function} validation middleware
 */
const validateParameters = (schema, getParams) => (req, res, next) => {
    try {
        const payload = getParams(req);
        const isValid = Joi.validate(payload, schema);

        if (isValid.error) {
            return res.status(422).json({
                error: formatError(isValid.error),
            });
        }
        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = validateParameters;
