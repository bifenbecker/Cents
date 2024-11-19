const Joi = require('@hapi/joi');
const validateTimings = require('../locations/validateTimings');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        shifts: Joi.array().items(
            Joi.object().keys({
                id: Joi.number().integer().optional().allow('', null),
                name: Joi.string(),
                type: Joi.string().required(),
                timings: Joi.array().items(
                    Joi.object().keys({
                        id: Joi.number().integer(),
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
                        zoneIds: Joi.array().optional().allow(null, ''),
                        deliveryTimingSettings: Joi.object()
                            .keys({
                                id: Joi.number().integer().optional().allow('', null),
                                maxStops: Joi.number().integer().allow(null).optional(),
                                serviceType: Joi.string()
                                    .valid('ALL', 'PICKUP', 'RETURN')
                                    .required(),
                            })
                            .optional(),
                    }),
                ),
            }),
        ),
    });

    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validate(req, res, next) {
    try {
        /*
        Type validations.
         */
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }

        const { shifts } = req.body;
        /*
        Check whether all the new timings are valid or not for every shift.
        */
        shifts.forEach((shift) => {
            const { timings } = shift;
            if (!validateTimings(timings)) {
                res.status(422).json({
                    error: 'Start time should be less than end point.',
                });
            }
        });
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validate;
