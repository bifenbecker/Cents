const Joi = require('@hapi/joi');

const Store = require('../../models/store');

const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required().min(1),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}
async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        const isValid = typeValidations({ id });
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const isStoreValid = await Store.query().findOne({
            id,
            businessId: business.id,
        });
        if (!isStoreValid) {
            res.status(404).json({
                error: 'Store not found.',
            });
            return;
        }
        req.constants = {
            needsRegions: business.needsRegions,
            store: isStoreValid,
        };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
