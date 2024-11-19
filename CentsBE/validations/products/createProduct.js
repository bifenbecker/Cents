const Joi = require('@hapi/joi');
const Inventory = require('../../models/inventory');

async function checkName(name, categoryId) {
    let isProduct = Inventory.query()
        .select('inventoryCategories.name', 'inventory.productName')
        .join('inventoryCategories', 'inventoryCategories.id', 'inventory.categoryId')
        .where('inventory.productName', 'ilike', name)
        .andWhere('inventory.deletedAt', null);
    isProduct = categoryId
        ? isProduct.where({
              'inventoryCategories.id': categoryId,
          })
        : isProduct;
    isProduct = await isProduct;
    return isProduct;
}

async function createProduct(req, res, next) {
    try {
        const schema = Joi.object().keys({
            categoryId: Joi.number().integer().required(),
            productName: Joi.string()
                .min(1)
                .trim()
                .required()
                .error(new Error('Product name cannot be empty.')),
            description: Joi.string().trim().allow(null, '').optional(),
            sku: Joi.string().allow(null, '').optional(),
            inventoryItems: Joi.array().items(
                Joi.object().keys({
                    id: Joi.number().integer().required(),
                    isFeatured: Joi.boolean().required(),
                    isTaxable: Joi.boolean().required(),
                    price: Joi.number().required().error(new Error('Price should be positive')),
                    quantity: Joi.number()
                        .required()
                        .error(new Error('Quantity should be positive')),
                    storeId: Joi.number().integer().required(),
                    store: Joi.any(),
                }),
            ),
        });
        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        if (req.body.productName.trim().length === 0) {
            res.status(422).json({
                error: 'Product name cannot be empty',
            });
            return;
        }
        if (req.body.productName.trim().length < 2) {
            res.status(422).json({
                error: 'Product name should have at least 2 characters.',
            });
            return;
        }

        const nameExits = await checkName(req.body.productName.trim(), req.body.categoryId);
        if (nameExits.length) {
            res.status(409).json({
                error: `${req.body.productName.trim()} already exists in ${nameExits[0].name}.
                 Please choose a different name.`,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = createProduct;
