const { transaction } = require('objection');
const Store = require('../../../../models/store');
const ServicePrices = require('../../../../models/servicePrices');
const ServiceCategories = require('../../../../models/serviceCategories');

async function returnServices(businessId, storeId, trx) {
    const storeServices = await ServicePrices.query(trx)
        .select('serviceId', 'id')
        .where('storeId', storeId)
        .andWhere('deletedAt', null);
    // select only active services.
    const businessServices = await ServiceCategories.query(trx)
        .select(
            'servicesMaster.id as serviceId',
            'defaultPrice',
            'minQty',
            'minPrice',
            'hasMinPrice',
            'servicesMaster.deletedAt',
        )
        .join('servicesMaster', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
        .where('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.deletedAt', null)
        .andWhere('serviceCategories.deletedAt', null);
    // update or add only that services that are present in businessServices.
    const newServices = [];
    const deletedServices = [];
    for (const businessService of businessServices) {
        const isService = storeServices.find(
            (service) => service.serviceId === businessService.serviceId,
        );
        // if service already exists or not.
        if (!isService) {
            // new service
            const serviceObj = {
                storeId,
                minQty: businessService.minQty,
                minPrice: businessService.minPrice,
                serviceId: businessService.serviceId,
                storePrice: businessService.defaultPrice,
            };
            newServices.push(serviceObj); // add record to newServices.
        }
    }
    for (const storeService of storeServices) {
        const isPresent = businessServices.find(
            (service) => service.serviceId === storeService.serviceId,
        );
        if (!isPresent) {
            deletedServices.push(storeService.id);
        }
    }
    return { newServices, deletedServices };
}

async function fullService(req, res, next) {
    let trx = null;
    try {
        const { store } = req.constants;
        const { offersFullService } = req.body;
        trx = await transaction.start(Store.knex());
        // update the store
        await Store.query(trx)
            .patch({
                offersFullService,
            })
            .findById(store.id);
        if (offersFullService === false) {
            // update hubId to null for other stores.
            await Store.query(trx)
                .patch({
                    hubId: null,
                })
                .where('hubId', store.id);
            await trx.commit();
        } else {
            const { newServices, deletedServices } = await returnServices(
                store.businessId,
                store.id,
            );
            if (newServices.length) {
                await ServicePrices.query(trx).insert(newServices);
            }
            if (deletedServices.length) {
                await ServicePrices.query(trx)
                    .patch({
                        deletedAt: new Date().toISOString(),
                    })
                    .whereIn('id', deletedServices);
            }
            await trx.commit();
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        next(error);
    }
}

module.exports = exports = fullService;
