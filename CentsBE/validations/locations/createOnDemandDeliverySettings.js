const Joi = require('@hapi/joi');
const validateTimings = require('./validateTimings');
const Shift = require('../../models/shifts');

function validateSettings(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().integer().required(),
        subsidyInCents: Joi.number().integer().min(0).required(),
        returnOnlySubsidyInCents: Joi.number().integer().min(0).required(),
        shifts: Joi.array().items(
            Joi.object().keys({
                name: Joi.string().required(),
                type: Joi.string().required(),
                timings: Joi.array().items(
                    Joi.object().keys({
                        day: Joi.number().integer().required(),
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
                ),
            }),
        ),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validateOnDemandDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        req.body.storeId = storeId;
        const isValid = validateSettings(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }

        const shiftNames = req.body.shifts.map((shift) => shift.name);
        const shiftExist = await Shift.query()
            .whereIn('name', shiftNames)
            .andWhere('type', 'CENTS_DELIVERY')
            .andWhere('storeId', '=', storeId);
        if (shiftExist.length) {
            res.status(422).json({
                error: 'Shift already exists.',
            });
            return;
        }
        const timings = req.body.shifts.map((timing) => timing.timings);
        const validateTiming = validateTimings(timings);
        if (!validateTiming) {
            res.status(422).json({
                error: 'Start time should be less than end point.',
            });
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validateOnDemandDeliverySettings;
