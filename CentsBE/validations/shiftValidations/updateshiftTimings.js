const Joi = require('@hapi/joi');

const shifts = require('../../commons/commonGets/shiftsGet');
const allTimingIds = require('../../commons/commonGets/shiftTimingGet');

const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer(),
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
                deliveryTimingSettings: Joi.object()
                    .keys({
                        id: Joi.number().integer().optional().allow('', null),
                        maxStops: Joi.number().integer().allow(null).optional(),
                        serviceType: Joi.string().valid('ALL', 'PICKUP', 'RETURN').required(),
                    })
                    .optional()
                    .allow(null),
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
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }
        const business = await getBusiness(req);
        const allShiftIds = await shifts(business.id);
        /*
        check whether shiftId is valid or not.
         */
        if (allShiftIds.indexOf(req.body.id) === -1) {
            res.status(404).json({
                error: 'Invalid shift id.',
            });
            return;
        }
        /*
         check whether timingId's are valid or not.
         */
        const allTimings = await allTimingIds(req.body.id);
        for (let i = 0; i < req.body.timings.length; i++) {
            if (req.body.timings[i].id && allTimings.indexOf(req.body.timings[i].id) === -1) {
                res.status(404).json({
                    error: 'Invalid timing id',
                });
                return;
            }
        }
        const { timings } = req.body;
        /*
        Check whether all the new timings are valid or not.
        */
        for (let j = 0; j < timings.length; j++) {
            if (
                timings[j].startTime !== null &&
                timings[j].endTime !== null &&
                timings[j].startTime >= timings[j].endTime
            ) {
                res.status(422).json({
                    error: 'Start tine should be less than end point.',
                });
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = validate;
