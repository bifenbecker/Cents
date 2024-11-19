const ServiceCategoryType = require('../../../../models/serviceCategoryType');
const InventoryCategory = require('../../../../models/inventoryCategory');

/**
 * Get a list of all services and products for sale for a ServiceOrder.
 *
 * The list of services should follow a similar hierarchy:
 *
 * ServiceCategoryType -> ServiceCategory -> Services
 *
 * Products should follow something similar:
 *
 * InventoryCategory -> Inventory -> InventoryItem
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function getServicesAndProducts(req, res, next) {
    try {
        const { currentStore } = req;
        const services = await ServiceCategoryType.query()
            .withGraphJoined(
                `
              serviceCategories(alphabeticalCategoryType).[services(alphabeticalService).[pricingStructure, prices, serviceModifiers]]
            `,
            )
            .modifiers({
                alphabeticalCategoryType: (query) => {
                    query.orderBy('category', 'asc');
                },
                alphabeticalService: (query) => {
                    query.orderBy('name', 'asc');
                },
            })
            .where('serviceCategories.businessId', currentStore.businessId)
            .andWhere('serviceCategories.deletedAt', null)
            .andWhere('serviceCategories:services.deletedAt', null)
            .andWhereNot('serviceCategories.category', 'DELIVERY')
            .orderBy('type', 'asc');
        const products = await InventoryCategory.query()
            .withGraphJoined('inventory')
            .where('inventoryCategories.businessId', currentStore.businessId)
            .andWhere('inventoryCategories.deletedAt', null)
            .andWhere('inventory.isDeleted', false)
            .andWhere('inventory.deletedAt', null);
        return res.json({
            success: true,
            services,
            products,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = {
    getServicesAndProducts,
};
