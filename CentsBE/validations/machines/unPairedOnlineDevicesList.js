const Joi = require('@hapi/joi');

const Store = require('../../models/store');

const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeIds: Joi.array().items(Joi.number().required()).required().min(1),
        page: Joi.number().required(),
        keyword: Joi.string().optional(),
        limit: Joi.number().optional(),
    });
    const validate = Joi.validate(inputObj, schema, { abortEarly: false });
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { storeIds } = req.query;
        const isValid = typeValidations({ ...req.query });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        let business;
        if (req.currentUser) {
            business = (await getBusiness(req)).id;
        } else {
            business = req.currentStore.businessId;
        }
        const areStoresValid = await Store.query()
            .whereIn('id', storeIds)
            .andWhere('businessId', business);
        if (areStoresValid.length !== storeIds.length) {
            res.status(409).json({
                error: 'Invalid store id(s).',
            });
            return;
        }
        req.constants = { business };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
