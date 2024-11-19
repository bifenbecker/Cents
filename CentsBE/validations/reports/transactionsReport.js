const Joi = require('@hapi/joi');
const timeRangeSchema = require('./timeRangeSchema');
const storesSchema = require('./storesSchema');

const paramsSchema = Joi.object().keys({
    ...timeRangeSchema,
    ...storesSchema,
    status: Joi.string().required(),
});

function validateTransactionsReport(req, res, next) {
    try {
        const payload = req.query;
        const validation = Joi.validate(payload, paramsSchema);

        if (validation.error) {
            res.status(422).json({
                error: /\[.*\]/.test(validation.error.message)
                    ? validation.error.message.split('[')[1].split(']')[0]
                    : validation.error.message,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateTransactionsReport;
