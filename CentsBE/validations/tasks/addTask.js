const Joi = require('@hapi/joi');
const getBusiness = require('../../utils/getBusiness');

function typeValidation(input) {
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        isPhotoNeeded: Joi.boolean().optional(),
        assignedLocations: Joi.array().items(Joi.number()).min(1).required(),
        assignedDays: Joi.array().items(Joi.number()).min(1).required(),
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

async function storeValidation(business, locations) {
    try {
        let error = '';
        const allStores = await business.getLocations();
        for (const location of locations) {
            const locationExists = allStores.some((store) => store.id === location);
            if (!locationExists) {
                error = 'Invalid location Id.';
                return error;
            }
        }
        return error;
    } catch (error) {
        throw new Error(error);
    }
}
async function validations(req, res, next) {
    try {
        const isValid = typeValidation(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message.split('[')[1].split(']')[0],
            });
            return;
        }

        const business = await getBusiness(req);
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
}

module.exports = exports = {
    validations,
    storeValidation,
};
