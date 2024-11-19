// Packages
const { transaction } = require('objection');

// Models
const ServiceCategoryType = require('../../../../models/serviceCategoryType');
const Service = require('../../../../models/services');
const ServiceCategory = require('../../../../models/serviceCategories');
const InventoryCategory = require('../../../../models/inventoryCategory');
const ServicePricingStructure = require('../../../../models/servicePricingStructure');

// Utils
const getBusiness = require('../../../../utils/getBusiness');

/**
 * Get a list of all services for a business, broken out by category hierarchy
 *
 * This function performs the following operations:
 *
 * 1) Retrieve all ServiceTypeCategory entries
 * 2) For each ServiceTypeCategory, retrieve all ServiceCategory entries
 * 3) For each ServiceCategory, retrieve all Service entries
 * 4) Retrieve all products
 *
 * All dependent on the current business
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getServicesByCategory(req, res, next) {
    try {
        const business = await getBusiness(req);

        const categories = await ServiceCategoryType.query()
            .withGraphJoined(
                'serviceCategories(alphabeticalCategoryType).[services(alphabeticalService, onlyUnarchived).[pricingStructure, prices]]',
            )
            .modifiers({
                alphabeticalCategoryType: (query) => {
                    query.orderBy('category', 'asc');
                },
                alphabeticalService: (query) => {
                    query.orderBy('name', 'asc');
                },
                onlyUnarchived: (query) => {
                    const isShowArchived = req.query.archived === 'true';
                    if (!isShowArchived) {
                        query.where('isDeleted', false).andWhere('deletedAt', null);
                    }
                },
            })
            .where('serviceCategories.businessId', business.id)
            .andWhere('serviceCategories.deletedAt', null)
            .andWhereNot('serviceCategories.category', 'DELIVERY')
            .orderBy('type', 'asc');
        const products = await InventoryCategory.query()
            .withGraphJoined('inventory')
            .where('inventoryCategories.businessId', business.id)
            .andWhere('inventoryCategories.deletedAt', null)
            .andWhere('inventory.isDeleted', false)
            .andWhere('inventory.deletedAt', null);

        return res.json({
            success: true,
            categories,
            products,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the related ServiceCategory entries for a given Service
 *
 * @param {Object} res
 * @param {Object} res
 * @param {void} next
 */
async function getServiceCategoriesForService(req, res, next) {
    try {
        const { id } = req.params;
        const business = await getBusiness(req);
        const service = await Service.query().withGraphFetched('serviceCategory').findById(id);
        const { serviceCategory } = service;
        const serviceCategories = await ServiceCategory.query()
            .where({
                serviceCategoryTypeId: serviceCategory.serviceCategoryTypeId,
                businessId: business.id,
            })
            .andWhere('deletedAt', null)
            .andWhereNot('category', 'DELIVERY')
            .distinctOn('category');

        return res.json({
            success: true,
            categories: serviceCategories,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Get the related ServiceCategory entries for a given ServiceCategoryType
 *
 * @param {Object} res
 * @param {Object} res
 * @param {void} next
 */
async function getServiceCategoriesForType(req, res, next) {
    try {
        const { id } = req.params;
        const business = await getBusiness(req);
        const serviceCategories = await ServiceCategory.query()
            .where({
                serviceCategoryTypeId: id,
                businessId: business.id,
            })
            .andWhere('deletedAt', null)
            .andWhereNot('category', 'DELIVERY')
            .distinctOn('category');

        return res.json({
            success: true,
            categories: serviceCategories,
        });
    } catch (error) {
        return next(error);
    }
}

/**
 * Create a new ServiceCategory for a given ServiceCategoryType
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function createNewServiceCategory(req, res, next) {
    let trx = null;
    try {
        const { category, serviceCategoryTypeId } = req.body;
        const business = await getBusiness(req);

        trx = await transaction.start(ServiceCategory.knex());

        const newCategory = await ServiceCategory.query(trx).insert({
            category,
            businessId: business.id,
            serviceCategoryTypeId,
        });

        await trx.commit();

        return res.json({
            success: true,
            category: newCategory,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Update the turnaround time for all ServiceCategories belonging to a given ServiceCategoryType
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function updateServiceCategoryTurnAroundTime(req, res, next) {
    let trx = null;
    try {
        const { turnAroundInHours, serviceCategoryTypeId } = req.body;

        trx = await transaction.start(ServiceCategory.knex());

        const serviceCategories = await ServiceCategory.query(trx).where({
            serviceCategoryTypeId,
        });

        const updatedCategories = serviceCategories.map((category) =>
            ServiceCategory.query(trx)
                .patch({
                    turnAroundInHours,
                })
                .findById(category.id),
        );

        await Promise.all(updatedCategories);

        await trx.commit();

        return res.json({
            success: true,
            turnAroundInHours,
        });
    } catch (error) {
        if (trx) {
            await trx.rollback();
        }
        return next(error);
    }
}

/**
 * Get a list of all ServicePricingStructure entries
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getAllServicePricingStructures(req, res, next) {
    try {
        const pricingStructures = await ServicePricingStructure.query();

        return res.json({
            success: true,
            pricingStructures,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getServicesByCategory,
    getServiceCategoriesForService,
    createNewServiceCategory,
    updateServiceCategoryTurnAroundTime,
    getAllServicePricingStructures,
    getServiceCategoriesForType,
};
