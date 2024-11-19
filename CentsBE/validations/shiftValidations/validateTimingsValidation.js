const Joi = require('@hapi/joi');

const { SHIFT_TYPES } = require('../../lib/constants');
const validateTimings = require('../locations/validateTimings');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().integer().required(),
        timingIds: Joi.array().items(Joi.number()).required(),
        type: Joi.string().required().valid(Object.values(SHIFT_TYPES)),
        timing: Joi.object().keys({
            isActive: Joi.boolean().required(),
            startTime: Joi.when('isActive', {
                is: true,
                then: Joi.date().required(),
                otherwise: Joi.allow(null).optional(),
            }).required(),
            endTime: Joi.when('isActive', {
                is: true,
                then: Joi.date().required(),
                otherwise: Joi.allow(null).optional(),
            }).required(),
        }),
    });

    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validateTimingsValidation(req, res, next) {
    try {
        const { timingIds, type, timing } = req.body;
        const { storeId } = req.params;

        // Type Validations
        const isValid = typeValidations({
            storeId,
            timingIds,
            type,
            timing,
        });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }

        // Validate start and end times for timings
        if (!validateTimings([timing])) {
            res.status(422).json({
                error: 'Start time should be less than end time.',
            });
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validateTimingsValidation;
