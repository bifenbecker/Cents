const Joi = require('@hapi/joi');
const formatError = require('../../utils/formatError');

async function typeValidations(req, res, next) {
    try {
        const { shiftTimingId } = req.params;
        const { date } = req.query;
        const schema = Joi.object().keys({
            shiftTimingId: Joi.number().integer().required(),
            date: Joi.date().optional(),
        });
        const isValid = Joi.validate({ shiftTimingId, date }, schema);
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
