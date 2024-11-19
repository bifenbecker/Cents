const Joi = require('@hapi/joi');

const ServicePrices = require('../../../models/servicePrices');

function typeValidations(inputObj) {
    const schema = Joi.object().keys({
        storeId: Joi.number().integer().required(),
        services: Joi.array()
            .items(
                Joi.object().keys({
                    id: Joi.number().integer().required(),
                    category: Joi.string().required(),
                    services: Joi.array()
                        .items(
                            Joi.object().keys({
                                id: Joi.number().integer().required(),
                                serviceCategoryId: Joi.number().integer().required(),
                                name: Joi.string().required(),
                                defaultPrice: Joi.number().required(),
                                hasMinPrice: Joi.boolean().required(),
                                description: Joi.string().required().allow(null),
                                minPrice: Joi.when('hasMinPrice', {
                                    is: true,
                                    then: Joi.number().required().min(0).allow(null),
                                    otherwise: Joi.any(),
                                }),
                                prices: Joi.array()
                                    .items(
                                        Joi.object().keys({
                                            id: Joi.number().integer().required(),
                                            storeId: Joi.number().integer().required(),
                                            serviceId: Joi.number().integer().required(),
                                            storePrice: Joi.number().required().min(0),
                                            // price for first responders is 0.
                                            minQty: Joi.number().required().min(0).allow(null),
                                            // minQty can be 0.
                                            minPrice: Joi.number().required().min(0).allow(null),
                                            // minQty can be 0 (first responders).
                                            isFeatured: Joi.boolean().required(),
                                        }),
                                    )
                                    .required(),
                                minQty: Joi.when('hasMinPrice', {
                                    is: true,
                                    then: Joi.number().required().min(0).allow(null),
                                    otherwise: Joi.any(),
                                }),
                            }),
                        )
                        .required(),
                }),
            )
            .required(),
    });
    const validate = Joi.validate(inputObj, schema);
    return validate;
}

function mapServices(services) {
    const resp = [];
    for (const service of services) {
        for (const i of service.services) {
            const temp = {
                ...i.prices[0],
                category: service.category,
            };
            resp.push(temp);
        }
    }
    return resp;
}

function validatePriceAndQty(input, dbRecord) {
    if (input === null && dbRecord === null) {
        return true;
    }
    if (input >= 0 && input !== null && dbRecord >= 0 && dbRecord !== null) {
        return true;
    }
    if (input !== null && dbRecord === null) {
        return false;
    }
    return false;
}

async function getServices(storeId) {
    const services = await ServicePrices.query()
        .select('serviceCategories.category as category', 'servicePrices.*')
        .join('servicesMaster', 'servicePrices.serviceId', 'servicesMaster.id')
        .join('serviceCategories', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
        .where('storeId', storeId)
        .andWhere('servicePrices.deletedAt', null);
    return services;
}

async function validateRequest(req, res, next) {
    try {
        const { id } = req.params;
        req.body.storeId = id;
        const isValid = typeValidations(req.body);
        if (isValid.error) {
            res.status(422).json({
                error: isValid.error.message,
            });
            return;
        }
        const { services } = req.body;
        const { store } = req.constants;
        // if (!store.offersFullService) {
        //     res.status(400).json({
        //         error: 'Store isn\'t a full service store.',
        //     });
        //     return;
        // }
        const offeredServices = await getServices(store.id);
        const mappedServices = mapServices(services);
        if (offeredServices.length !== mappedServices.length) {
            res.status(409).json({
                error: 'Invalid services',
            });
            return;
        }
        const finalData = [];
        for (const i of mappedServices) {
            const findService = offeredServices.find(
                (service) => service.id === i.id && service.serviceId === i.serviceId,
            );
            // service is not found.
            if (!findService) {
                res.status(404).json({
                    error: 'Missing service.',
                });
                return;
            }
            // check if service is of type fixed price,
            // then there should be no minQty and minPrice associated with it.
            if (findService.category === 'FIXED_PRICE' && (i.minPrice || i.minQty)) {
                res.status(422).json({
                    error: 'Min quantity and min price are only for per pound items',
                });
                return;
            }
            // check for min qty.
            if (!validatePriceAndQty(i.minQty, findService.minQty)) {
                res.status(409).json({
                    error: 'Invalid minimum quantity.',
                });
                return;
            }
            // check for min price.
            if (!validatePriceAndQty(i.minPrice, findService.minPrice)) {
                res.status(409).json({
                    error: 'Invalid minimum price.',
                });
                return;
            }
            delete i.category;
            const insertObject = {
                ...i,
            };
            finalData.push(insertObject);
        }
        req.constants.data = finalData;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = validateRequest;
