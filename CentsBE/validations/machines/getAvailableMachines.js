const Joi = require('@hapi/joi');
const Store = require('../../models/store');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().integer().required().min(1),
        type: Joi.string().valid(['WASHER', 'DRYER']).required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const { storeId } = req.params;
        const { type } = req.query;
        const isValid = typeValidations({
            storeId,
            type,
        });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        const business = req.currentStore.businessId;
        const areStoresValid = await Store.query()
            .where('id', storeId)
            .andWhere('businessId', business);
        if (areStoresValid.length === 0) {
            res.status(409).json({
                error: 'Invalid store id.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
