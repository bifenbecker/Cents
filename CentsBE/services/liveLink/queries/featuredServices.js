const Services = require('../../../models/services');

async function getFeaturedServices(payload, type) {
    const { queryColumn, queryColumnValue } = payload;
    let services = Services.query()
        .withGraphJoined('[serviceCategory(categoryFilter),prices(pricesFilter)]')
        .modifiers({
            categoryFilter: (query) => {
                query.select('category');
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
                    )
                    .where(queryColumn, queryColumnValue)
                    .andWhere('deletedAt', null);
            },
        })
        .andWhere('servicesMaster.isDeleted', false)
        .andWhere('prices.isFeatured', true)
        .andWhere('serviceCategory.category', type || 'FIXED_PRICE')
        .orderBy('servicesMaster.name', 'asc');
    services =
        queryColumn === 'storeId'
            ? await services.andWhere('prices.storeId', queryColumnValue)
            : await services;
    return services;
}

module.exports = exports = getFeaturedServices;
