const Joi = require('@hapi/joi');
const validateTimings = require('./validateTimings');
const Shift = require('../../models/shifts');

function validateSettings(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().integer().required(),
        hasZones: Joi.boolean().required(),
        deliveryFeeInCents: Joi.number().integer().required(),
        returnDeliveryFeeInCents: Joi.number().integer().optional(),
        zipCodes: Joi.when('hasZones', {
            is: false,
            then: Joi.array()
                .items(Joi.string().allow('', null).optional())
                .required()
                .error(new Error('zipCodes are required')),
            otherwise: Joi.allow(null).optional(),
        }),
        deliveryTierId: Joi.number().integer().optional(),
        zones: Joi.when('hasZones', {
            is: true,
            then: Joi.array()
                .items(
                    Joi.object().keys({
                        name: Joi.string().required().max(20),
                        zipCodes: Joi.array()
                            .items(Joi.string().allow('', null).optional())
                            .required(),
                    }),
                )
                .required()
                .error(new Error('zones are required')),
            otherwise: Joi.allow(null).optional(),
        }),
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
                        zones: Joi.when('hasZones', {
                            is: true,
                            then: Joi.array()
                                .items(Joi.number().allow('', null).optional())
                                .required()
                                .error(new Error('zoneNames are required')),
                            otherwise: Joi.allow(null).optional(),
                        }),
                        deliveryTimingSettings: Joi.object().keys({
                            maxStops: Joi.number().integer().allow(null).optional(),
                            serviceType: Joi.string().valid('ALL', 'PICKUP', 'RETURN').required(),
                        }),
                    }),
                ),
            }),
        ),
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validateDeliverySettings(req, res, next) {
    try {
        const { storeId } = req.params;
        req.body.storeId = storeId;
        // data validation
        const isValid = validateSettings(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        // shifts validation
        const shiftNames = req.body.shifts.map((shift) => shift.name);
        const shiftExist = await Shift.query()
            .whereIn('name', shiftNames)
            .andWhere('type', 'OWN_DELIVERY')
            .andWhere('storeId', '=', storeId);
        if (shiftExist.length) {
            res.status(422).json({
                error: 'Shift already exists.',
            });
            return;
        }
        // timings validation
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

module.exports = validateDeliverySettings;
