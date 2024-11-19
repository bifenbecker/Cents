const Joi = require('@hapi/joi');
const InventoryCategory = require('../../models/inventoryCategory');
const getBusiness = require('../../utils/getBusiness');

async function createProductCategory(req, res, next) {
    try {
        const business = await getBusiness(req);
        const schema = Joi.object().keys({
            id: Joi.number().integer().allow(null).optional(),
            name: Joi.string()
                .min(2)
                .required()
                .error(new Error('Product CategoryName should have at least two characters.')),
        });
        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        if (req.body.name.trim().length === 0) {
            res.status(422).json({
                error: 'Category name cannot be empty',
            });
            return;
        }
        // checking if the new categoryName is already existed
        const getCategory = await InventoryCategory.query()
            .where('inventoryCategories.name', 'ilike', req.body.name.trim())
            .andWhere('businessId', business.id);
        if (getCategory.length) {
            if (getCategory[0].name) {
                res.status(400).json({
                    error: `Category ${req.body.name.trim()} already exist. Please choose a different name.`,
                });
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = createProductCategory;
