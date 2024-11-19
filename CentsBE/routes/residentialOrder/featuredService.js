const { raw } = require('objection');
const ServicePrice = require('../../models/servicePrices');

async function featuredService(req, res, next) {
    try {
        const { id, businessId } = req.currentStore;
        const laundryPrice = await ServicePrice.query()
            .select(
                'servicePrices.id as priceId',
                raw('coalesce("servicePrices"."storePrice", 0) as price'),
                'servicePrices.storeId as storeId',
                'servicesMaster.name as lineItemName',
                'servicesMaster.hasMinPrice',
                raw(
                    'case when "hasMinPrice" is true then "servicePrices"."minQty" else null end as "minimumQuantity"',
                ),
                raw(
                    'case when "hasMinPrice" is true then "servicePrices"."minPrice" else null end as "minimumPrice"',
                ),
                'servicesMaster.description as description',
                'serviceCategories.category as category',
                raw('\'SERVICE\' as "lineItemType"'),
                'servicesMaster.id as serviceId',
            )
            .join('servicesMaster', 'servicesMaster.id', 'servicePrices.serviceId')
            .join('serviceCategories', 'serviceCategories.id', 'servicesMaster.serviceCategoryId')
            .andWhere('serviceCategories.businessId', businessId)
            .andWhere('servicesMaster.isDeleted', false)
            .whereIn('serviceCategories.category', ['FIXED_PRICE', 'PER_POUND'])
            .where((query) => {
                query
                    .where('servicePrices.isFeatured', true)
                    .andWhere('servicePrices.deletedAt', null)
                    .andWhere('servicesMaster.deletedAt', null);
            })
            .where('storeId', id)
            .orderBy('lineItemName', 'asc')
            .first();

        res.status(200).json({
            success: true,
            laundryPrice,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = featuredService;
