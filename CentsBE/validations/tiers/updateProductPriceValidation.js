const Joi = require('@hapi/joi');

const getBusiness = require('../../utils/getBusiness');
const getPricingTierDetails = require('../../queryHelpers/getPricingTierDetails');
const { getProductDetails, getFeaturedProducts } = require('../../queryHelpers/getProductDetails');
const { getFeaturedServicePrices } = require('../../queryHelpers/getServiceDetails');

async function updateProductPriceValidation(req, res, next) {
    try {
        const schema = Joi.object().keys({
            tierId: Joi.number().integer().required(),
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
        if (!business) {
            res.status(400).json({
                error: 'Invalid request. Could not find the provided business',
            });
            return;
        }
        const { tierId, inventoryId, field, value } = req.body;
        const pricingTier = await getPricingTierDetails(tierId, business.id);
        if (!pricingTier) {
            res.status(404).json({
                error: 'Pricing Tier not found',
            });
            return;
        }
        const product = await getProductDetails(inventoryId, business.id);
        if (!product) {
            res.status(404).json({
                error: 'Product not found',
            });
            return;
        }
        const featuredProducts = await getFeaturedProducts(tierId);
        if (
            field === 'isFeatured' &&
            !value &&
            (await getFeaturedServicePrices(tierId)).length === 0 &&
            featuredProducts.length === 1 &&
            featuredProducts[0].inventoryId === inventoryId
        ) {
            res.status(422).json({
                error: 'At least one product or service must be available for sale in order to update a pricing tier.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateProductPriceValidation;
