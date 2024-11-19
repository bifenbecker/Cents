const ServicePrice = require('../../../models/servicePrices');

/**
 * Determine whether the ServicePrice requested belongs to the business provided.
 *
 * The serviceCategoryId is a NOT NULL foreign key for the ServiceMaster,
 * so we don't need to check for presence of the serviceCategory relation
 *
 * @param {Number} businessId
 * @param {Number} serviceId
 */
async function serviceBelongsToStore(businessId, serviceId) {
    const servicePrice = await ServicePrice.query()
        .withGraphFetched('[service.[serviceCategory]]')
        .findById(serviceId);
    const { service } = servicePrice;
    const { serviceCategory } = service;
    const belongsToStore = serviceCategory.businessId === businessId;

    return belongsToStore;
}

module.exports = exports = serviceBelongsToStore;
