const Joi = require('@hapi/joi');
const Shift = require('../models/shifts');

function validateShifts(inputObj) {
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().required(),
        storeId: Joi.number().integer().required(),
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
    });
    const error = Joi.validate(inputObj, schema);
    return error;
}

async function validateTimings(req, res, next) {
    try {
        const { storeId } = req.query;
        req.body.storeId = storeId;
        const isValid = validateShifts(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }
        const shiftExist = await Shift.query()
            .findOne({ name: req.body.name })
            .where('storeId', '=', storeId);
        if (shiftExist) {
            res.status(422).json({
                error: 'Shift already exists.',
            });
            return;
        }
        const { timings } = req.body;
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

module.exports = validateTimings;
