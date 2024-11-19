const Joi = require('@hapi/joi');

const Store = require('../../models/store');
const InventoryItem = require('../../models/inventoryItem');

const getBusiness = require('../../utils/getBusiness');

async function updateProductPrices(req, res, next) {
    try {
        const schema = Joi.object().keys({
            storeId: Joi.number().integer().required(),
            inventoryId: Joi.number().integer().required(),
            field: Joi.string().required().valid('quantity', 'price', 'isFeatured', 'isTaxable'),
            value: Joi.when('field', {
                is: Joi.string().valid('quantity'),
                then: Joi.number().integer().required().min(0),
                otherwise: Joi.alternatives().when('field', {
                    is: Joi.string().valid('isFeatured', 'isTaxable'),
                    then: Joi.boolean().required(),
                    otherwise: Joi.alternatives().when('field', {
                        is: Joi.string().valid('price'),
                        then: Joi.number().min(0).required(),
                    }),
                }),
            }),
        });

        const isValid = Joi.validate(req.body, schema);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const business = await getBusiness(req);
        const isStore = await Store.query().findOne({
            id: req.body.storeId,
            businessId: business.id,
        });
        if (!isStore) {
            res.status(404).json({
                error: 'store not found',
            });
            return;
        }
        const { storeId, inventoryId } = req.body;
        const isActiveProduct = await InventoryItem.query().findOne({
            storeId,
            inventoryId,
            deletedAt: null,
        });
        if (!isActiveProduct) {
            res.status(404).json({
                error: 'Product price not found.',
            });
            return;
        }
        // check if incoming data is same as current data, just return the response
        const { field, value } = req.body;
        if (isActiveProduct[field] === value) {
            res.status(200).json({
                success: true,
                record: {
                    ...isActiveProduct,
                    prevId: isActiveProduct.id,
                },
            });
            return;
        }
        req.constants = {
            id: isActiveProduct.id,
        };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateProductPrices;
