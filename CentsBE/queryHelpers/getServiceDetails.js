const ServiceCategory = require('../models/serviceCategories');
const ServicePrice = require('../models/servicePrices');

async function getServiceDetails(id, businessId) {
    const service = await ServiceCategory.query()
        .join('servicesMaster', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
        .where('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.id', id)
        .andWhere('servicesMaster.deletedAt', null)
        .andWhere('serviceCategories.deletedAt', null)
        .first();
    return service;
}

async function getFeaturedServicePrices(pricingTierId) {
    const featuredServicePrices = await ServicePrice.query().where({
        pricingTierId,
        isFeatured: true,
        isDeliverable: true,
        deletedAt: null,
    });
    return featuredServicePrices;
}
module.exports = exports = {
    getServiceDetails,
    getFeaturedServicePrices,
};
