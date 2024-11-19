const Joi = require('@hapi/joi');
const Inventory = require('../../models/inventory');
const InventoryCategory = require('../../models/inventoryCategory');

const getBusiness = require('../../utils/getBusiness');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        id: Joi.number().integer().required(),
        productName: Joi.string()
            .min(1)
            .trim()
            .required()
            .error(new Error('Product name cannot be empty.')),
        description: Joi.string().trim().allow(null, '').optional(),
        sku: Joi.string().trim().allow(null, '').optional(),
        categoryId: Joi.number().integer().required(),
        productImage: Joi.string()
            .uri()
            .allow(null, '')
            .error(new Error('Product image should be a valid url.')),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

async function checkName(name, categoryId, productId) {
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
    isProduct = productId ? isProduct.where('inventory.id', '<>', productId) : isProduct;
    isProduct = await isProduct;
    return isProduct;
}

async function verifyFields(req, res, next) {
    try {
        const { id } = req.params;
        req.body.id = id;
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const isProduct = await Inventory.query().findById(req.body.id);
        if (!isProduct) {
            res.status(404).json({
                error: 'Product not found.',
            });
            return;
        }
        // check if incoming data has changed or not.
        if (req.body.productName.trim().length < 2) {
            res.status(422).json({
                error: 'Product name should have at least 2 characters.',
            });
            return;
        }
        // check if category is valid or not.
        const business = await getBusiness(req);
        // check for the category.
        const isCategory = await InventoryCategory.query().findOne({
            businessId: business.id,
            id: req.body.categoryId,
            deletedAt: null,
        });
        if (!isCategory) {
            res.status(404).json({
                error: 'Category not found.',
            });
            return;
        }
        if (req.body.productName.trim().length === 0) {
            res.status(422).json({
                error: 'Product name cannot be empty',
            });
            return;
        }

        // check if the name or category is changed or not.
        if (
            req.body.productName !== isProduct.productName ||
            req.body.categoryId !== isProduct.categoryId
        ) {
            const nameExits = await checkName(
                req.body.productName.trim(),
                req.body.categoryId,
                isProduct.id,
            );
            if (nameExits.length) {
                res.status(409).json({
                    error: `${req.body.productName.trim()} already exists in ${nameExits[0].name}.
                     Please choose a different name.`,
                });
                return;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyFields;
