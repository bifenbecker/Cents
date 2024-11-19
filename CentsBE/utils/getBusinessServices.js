const { raw } = require('objection');
const ServiceCategory = require('../models/serviceCategories');

async function getServices(businessId, transaction) {
    let services = transaction ? ServiceCategory.query(transaction) : ServiceCategory.query();
    services = await services
        .select(
            'servicesMaster.id as serviceId',
            raw('coalesce("servicesMaster"."defaultPrice", 0) as "storePrice"'),
            raw('coalesce("servicesMaster"."minQty", 0) as "minQty"'),
            raw('coalesce("servicesMaster"."minPrice", 0) as "minPrice"'),
            'servicesMaster.deletedAt',
            raw('true as "isFeatured"'),
        )
        .join('servicesMaster', 'servicesMaster.serviceCategoryId', 'serviceCategories.id')
        .where('serviceCategories.businessId', businessId)
        .andWhere('servicesMaster.deletedAt', null)
        .andWhere('servicesMaster.isDeleted', false)
        .andWhere('serviceCategories.deletedAt', null);
    return services;
}

module.exports = exports = getServices;
