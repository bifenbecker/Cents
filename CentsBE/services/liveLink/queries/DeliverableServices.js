const Services = require('../../../models/services');

async function getDeliverableServices(payload) {
    const { type, queryColumn, queryColumnValue } = payload;
    let services = Services.query()
        .withGraphJoined(
            '[pricingStructure, serviceCategory(categoryFilter),prices(pricesFilter),serviceModifiers(servicemodifierFilter).[modifier(modifierFilter)]]',
        )
        .modifiers({
            servicemodifierFilter: (query) => {
                query.select('id', 'isFeatured').where('isFeatured', true);
            },
            categoryFilter: (query) => {
                query.select('category');
            },
            modifierFilter: (query) => {
                query.select('id', 'businessId', 'name', 'description', 'price');
            },
            pricesFilter: (query) => {
                query
                    .select(
                        'id',
                        'storeId',
                        'serviceId',
                        'storePrice',
                        'minQty',
                        'minPrice',
                        'isFeatured',
                        'isDeliverable',
                        'isTaxable',
                        'pricingTierId',
                    )
                    .where('deletedAt', null)
                    .andWhere(queryColumn, queryColumnValue);
            },
        })
        .where('prices.isDeliverable', true)
        .andWhere('servicesMaster.isDeleted', false)
        .andWhere('prices.isFeatured', true)
        .orderBy('servicesMaster.name', 'asc');
    services = type ? await services.andWhere('serviceCategory.category', type) : await services;
    return services;
}

module.exports = exports = getDeliverableServices;
