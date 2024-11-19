const Joi = require('@hapi/joi');
const Store = require('../../models/store');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(req) {
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        modelId: Joi.number().integer().required(),
        storeId: Joi.number().integer().required(),
    });
    const error = Joi.validate(req, schema);
    return error;
}
/**
 *
 * function to validate machine name
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function validateMachineName(req, res, next) {
    try {
        const isValid = typeValidations(req.body);
        // Type validations.
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.details[0].message,
            });
            return;
        }
        let businessId;
        if (req.currentUser) {
            businessId = (await getBusiness(req)).id;
        } else {
            businessId = req.currentStore.businessId;
        }
        const isStoresValid = await Store.query()
            .where('id', req.body.storeId)
            .andWhere('businessId', businessId);
        if (!isStoresValid.length) {
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

module.exports = exports = validateMachineName;
