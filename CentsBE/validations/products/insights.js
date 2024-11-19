const Joi = require('@hapi/joi');

const InventoryCategory = require('../../models/inventoryCategory');
const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number()
            .integer()
            .min(1)
            .required()
            .error(new Error('Id of type number greater than 1 is required.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function validateRequest(req, res, next) {
    try {
        const isValid = typeValidations(req.params);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const isProduct = await InventoryCategory.query()
            .select('inventoryCategories.*')
            .join('inventory', 'inventory.categoryId', 'inventoryCategories.id')
            .where({
                'inventoryCategories.businessId': business.id,
                'inventory.id': req.params.id,
                'inventory.deletedAt': null,
            });
        if (!isProduct.length) {
            res.status(404).json({
                error: 'Product not found',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
