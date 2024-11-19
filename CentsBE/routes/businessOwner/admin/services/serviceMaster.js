const { transaction } = require('objection');
const ServicesMaster = require('../../../../models/services');
const ServicePrices = require('../../../../models/servicePrices');
const getBusiness = require('../../../../utils/getBusiness');

const { mapServiceAndCategories } = require('../../../../services/washServices/responseMappers');
const {
    getServices,
    getSingleServiceDetails,
    getServicePricesAndProducts,
} = require('../../../../services/washServices/queries');
const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');

const apiEnpoints = {
    getServices: async (req, resp, next) => {
        try {
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. No business exists';
                LoggerHandler('error', errMsg, req);
                return resp.status(400).json({
                    error: errMsg,
                });
            }
            const { offset, archived } = req.query;
            const servicesMaster = await getServices(business.id, offset, archived);
            const totalRecords = servicesMaster.length ? servicesMaster[0].totalRecords : 0;
            const result = mapServiceAndCategories(servicesMaster);
            return resp.status(200).json({
                totalRecords,
                categories: result,
            });
        } catch (error) {
            return next(error);
        }
    },
    getDryCleaningAndServices: async (req, resp, next) => {
        try {
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. No business exists';
                LoggerHandler('error', errMsg, req);
                return resp.status(400).json({
                    error: errMsg,
                });
            }

            const servicesMaster = await getServicePricesAndProducts(business.id);
            return resp.status(200).json({
                categories: [...servicesMaster.services],
            });
        } catch (error) {
            return next(error);
        }
    },
    saveService: async (req, resp, next) => {
        let trx = null;
        try {
            const business = await getBusiness(req);
            const { body } = req;
            const { modifiers, servicePricingStructure } = req.constants;
            if (!business) {
                const errMsg = 'Invalid request. No business exists';
                LoggerHandler('error', errMsg, req);
                return resp.status(400).json({
                    error: errMsg,
                });
            }
            const data = {
                serviceCategoryId: body.serviceCategoryId,
                description: body.description.trim() || null,
                defaultPrice: null,
                name: body.name.trim(),
                minQty: body.minQty === 0 || body.minQty ? body.minQty : null,
                minPrice: body.minPrice === 0 || body.minPrice ? body.minPrice : null,
                hasMinPrice: body.hasMinPrice != null ? body.hasMinPrice : false,
                servicePricingStructureId: body.servicePricingStructureId,
                piecesCount: body.piecesCount,
            };
            data.prices = req.body.prices.map((a) => ({
                storeId: a.storeId,
                storePrice: a.storePrice,
                isTaxable: a.isTaxable,
                minQty: servicePricingStructure.type === 'PER_POUND' ? a.minQty : null,
                minPrice: servicePricingStructure.type === 'PER_POUND' ? a.minPrice : null,
                isFeatured: a.isFeatured,
            }));
            if (servicePricingStructure.type === 'PER_POUND') {
                data.serviceModifiers = modifiers;
            }
            trx = await transaction.start(ServicesMaster.knex());
            const serviceMaster = await ServicesMaster.query(trx).insertGraphAndFetch(data);
            await trx.commit();
            return resp.status(200).json({
                success: true,
                serviceMaster,
            });
        } catch (error) {
            if (trx) {
                await trx.rollback();
            }
            return next(error);
        }
    },
    bulkUpdate: async (req, res, next) => {
        let trx = null;
        try {
            const business = await getBusiness(req);
            const { servicePriceIds, price } = req.body;
            trx = await transaction.start(ServicePrices.knex());
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            await Promise.all(
                servicePriceIds.map(async (id) => {
                    await ServicePrices.query(trx)
                        .patch({
                            storePrice: price.storePrice,
                            minQty: price.minQty,
                            minPrice: price.minPrice,
                            isTaxable: price.isTaxable,
                            updatedAt: new Date().toISOString,
                        })
                        .findById(id);
                }),
            );
            await trx.commit();
            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            if (trx) {
                await trx.rollback();
            }
            return next(error);
        }
    },
    updateServicePrices: async (req, res, next) => {
        let trx = null;
        try {
            const { field, value } = req.body;
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            trx = await transaction.start(ServicePrices.knex());
            const updatedPrice = await ServicePrices.query(trx)
                .patch({
                    [field]: value,
                    updatedAt: new Date().toISOString,
                })
                .findById(req.constants.id)
                .returning('*');
            await trx.commit();
            return res.status(200).json({
                success: true,
                record: updatedPrice,
            });
        } catch (error) {
            if (trx) {
                await trx.rollback();
            }
            return next(error);
        }
    },
    getService: async (req, res, next) => {
        try {
            const { id } = req.params;
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            if (!Number(id)) {
                const errMsg = 'serviceId of type number is required.';
                LoggerHandler('error', errMsg, req);
                return res.status(422).json({
                    error: errMsg,
                });
            }
            const service = await getSingleServiceDetails(id);
            return res.status(200).json({
                ...service,
            });
        } catch (error) {
            return next(error);
        }
    },
    servicePrices: async (req, res, next) => {
        try {
            const business = await getBusiness(req);
            if (!business) {
                const errMsg = 'Invalid request. Could not find the provided business';
                LoggerHandler('error', errMsg, req);
                return res.status(400).json({
                    error: errMsg,
                });
            }
            const servicePricesAndProducts = await getServicePricesAndProducts(business.id);
            return res.status(200).json({
                success: true,
                ...servicePricesAndProducts,
            });
        } catch (error) {
            return next(error);
        }
    },
};
module.exports = apiEnpoints;
