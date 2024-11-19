const Joi = require('@hapi/joi');
const timeRangeSchema = require('./timeRangeSchema');
const storesSchema = require('./storesSchema');

const paramsSchema = Joi.object().keys({
    ...timeRangeSchema,
    ...storesSchema,
});

function validateLaborReportPayload(req, res, next) {
    try {
        const payload = req.query;
        const validation = Joi.validate(payload, paramsSchema);

        if (validation.error) {
            return res.status(422).json({
                error: /\[.*\]/.test(validation.error.message)
                    ? validation.error.message.split('[')[1].split(']')[0]
                    : validation.error.message,
            });
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = validateLaborReportPayload;
