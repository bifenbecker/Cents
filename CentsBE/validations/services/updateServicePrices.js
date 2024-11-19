const Joi = require('@hapi/joi');

const Store = require('../../models/store');
const ServicePrices = require('../../models/servicePrices');

const getBusiness = require('../../utils/getBusiness');

async function updateServicePrices(req, res, next) {
    try {
        const schema = Joi.object().keys({
            storeId: Joi.number().integer().required(),
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
        const { storeId, serviceId, field, value } = req.body;
        const isActiveService = await ServicePrices.query().findOne({
            storeId,
            serviceId,
            deletedAt: null,
        });
        if (!isActiveService) {
            res.status(404).json({
                error: 'Service price not found.',
            });
            return;
        }
        if (isActiveService.isDeliverable && field === 'isFeatured' && !value) {
            res.status(409).json({
                error: 'Can not change featured to false when service is deliverable.',
            });
            return;
        }
        req.constants = {
            id: isActiveService.id,
        };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = updateServicePrices;
