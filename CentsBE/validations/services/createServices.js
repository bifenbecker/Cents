const Joi = require('@hapi/joi');
const Services = require('../../models/services');

async function checkName(name, serviceCategoryId) {
    let isService = Services.query()
        .select('serviceCategories.category', 'servicesMaster.name')
        .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
        .where('servicesMaster.name', 'ilike', name)
        .andWhere('servicesMaster.deletedAt', null)
        .andWhere('servicesMaster.isDeleted', false);
    isService = serviceCategoryId
        ? isService.where({
              'serviceCategories.id': serviceCategoryId,
          })
        : isService;
    isService = await isService;
    return isService;
}

async function verifyServices(req, res, next) {
    try {
        const schema = Joi.object().keys({
            serviceCategoryId: Joi.number().integer().required(),
            name: Joi.string()
                .required()
                .min(1)
                .trim()
                .error(new Error('Service name cannot be empty.')),
            description: Joi.string().trim().allow(null, '').optional(),
            hasMinPrice: Joi.boolean().required(),
            prices: Joi.array().items(
                Joi.object().keys({
                    id: Joi.number().integer().required(),
                    isFeatured: Joi.boolean().required(),
                    isTaxable: Joi.boolean().required(),
                    minPrice: Joi.number().when('hasMinPrice', {
                        is: true,
                        then: Joi.number().required().error(new Error('Price should be positive')),
                        otherwise: Joi.allow(null).optional(),
                    }),
                    minQty: Joi.number().when('hasMinPrice', {
                        is: true,
                        then: Joi.number()
                            .required()
                            .error(new Error('Quantity should be positive')),
                        otherwise: Joi.allow(null).optional(),
                    }),
                    store: Joi.any(),
                    storeId: Joi.number().integer().required(),
                    storePrice: Joi.number().required(),
                }),
            ),
            servicePricingStructureId: Joi.number().integer().required(),
            piecesCount: Joi.number().allow(null, '').optional(),
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
                error: 'Service name cannot be empty',
            });
            return;
        }
        if (req.body.name.trim().length < 2) {
            res.status(422).json({
                error: 'Service name should have at least 2 characters.',
            });
            return;
        }

        const nameExits = await checkName(req.body.name.trim(), req.body.serviceCategoryId);
        if (nameExits.length) {
            res.status(409).json({
                error: `${req.body.name.trim()} already exists in ${nameExits[0].category}.
                 Please choose a different name.`,
            });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = verifyServices;
