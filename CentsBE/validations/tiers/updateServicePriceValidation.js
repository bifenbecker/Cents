const Joi = require('@hapi/joi');

const getBusiness = require('../../utils/getBusiness');
const getPricingTierDetails = require('../../queryHelpers/getPricingTierDetails');
const {
    getServiceDetails,
    getFeaturedServicePrices,
} = require('../../queryHelpers/getServiceDetails');

async function updateServicePriceValidation(req, res, next) {
    try {
        const schema = Joi.object().keys({
            tierId: Joi.number().integer().required(),
            serviceId: Joi.number().integer().required(),
            field: Joi.string()
                .required()
                .valid('storePrice', 'minQty', 'minPrice', 'isFeatured', 'isTaxable'),
            value: Joi.when('field', {
                is: Joi.string().valid('storePrice', 'minPrice', 'minQty'),
                then: Joi.number().required(),
                otherwise: Joi.alternatives().when('field', {
                    is: Joi.string().valid('isFeatured', 'isTaxable'),
                    then: Joi.boolean().required(),
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
        const { tierId, serviceId, field, value } = req.body;
        const pricingTier = await getPricingTierDetails(tierId, business.id);
        if (!pricingTier) {
            res.status(404).json({
                error: 'Pricing Tier not found',
            });
            return;
        }
        const service = await getServiceDetails(serviceId, business.id);
        if (!service) {
            res.status(404).json({
                error: 'Service not found',
            });
            return;
        }
        const featuredServicePrices = await getFeaturedServicePrices(tierId);
        if (
            field === 'isFeatured' &&
            !value &&
            featuredServicePrices.length === 1 &&
            featuredServicePrices[0].serviceId === serviceId
        ) {
            res.status(422).json({
                error: 'At least one deliverable service must be available for sale in order to update a pricing tier.',
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateServicePriceValidation;
