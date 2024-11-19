const Joi = require('@hapi/joi');

const Task = require('../../models/tasks');

const { storeValidation } = require('./addTask');

const getBusiness = require('../../utils/getBusiness');

function typeValidation(input) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required(),
        name: Joi.string().required(),
        description: Joi.string().required(),
        isPhotoNeeded: Joi.boolean().optional(),
        assignedLocations: Joi.array().items(Joi.number()).min(1).required(),
        assignedDays: Joi.array().items(Joi.number()).min(1).required(),
        deletedAt: Joi.date().optional().allow(null, ''),
        assignedShifts: Joi.array()
            .items(
                Joi.object().keys({
                    name: Joi.string().required(),
                    isAssigned: Joi.boolean().optional(),
                }),
            )
            .min(1)
            .required(),
    });

    const error = Joi.validate(input, schema);
    return error;
}

module.exports = exports = async function updateTaskValidation(req, res, next) {
    try {
        const { id } = req.query;
        if (!id) {
            res.status(404).json({
                error: 'Task id is required.',
            });
            return;
        }
        req.body.id = id;
        const isValid = typeValidation(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }

        const business = await getBusiness(req);
        const isTask = await Task.query().findOne({
            businessId: business.id,
            id,
        });
        if (!isTask) {
            res.status(404).json({
                error: `Task with id: ${id} doesn't exist.`,
            });
            return;
        }
        req.business = business;
        const areLocationInvalid = await storeValidation(business, req.body.assignedLocations);
        if (areLocationInvalid.length) {
            res.status(422).json({
                error: areLocationInvalid,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
};
