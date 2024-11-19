const Joi = require('@hapi/joi');
const timeRangeSchema = require('./timeRangeSchema');
const storesSchema = require('./storesSchema');

const paramsSchema = Joi.object().keys({
    ...timeRangeSchema,
    ...storesSchema,
});

function validateCustomersReportPayload(req, res, next) {
    try {
        const payload = req.query;
        const isValid = Joi.validate(payload, paramsSchema);

        if (isValid.error) {
            return res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
        }
        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = validateCustomersReportPayload;
