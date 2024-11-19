const { raw } = require('objection');

const ServicePrices = require('../../../../models/servicePrices');
/**
 *
 * @description Returns insights for a service,
 *    Total Sold (#)
 *    Revenue ($)
 */
async function getInsights(req, res, next) {
    try {
        const { id } = req.params;
        const insights = await ServicePrices.query()
            .select(
                raw(`
        sum("serviceReferenceItemDetails"."lineItemQuantity") as "totalSold",
        sum("serviceReferenceItemDetails"."lineItemTotalCost") as "totalRevenue"
        `),
            )
            .join(
                'serviceReferenceItemDetails',
                'serviceReferenceItemDetails.soldItemId',
                'servicePrices.id',
            )
            .join(
                'serviceReferenceItems',
                'serviceReferenceItemDetails.serviceReferenceItemId',
                'serviceReferenceItems.id',
            )
            .join('serviceOrderItems', 'serviceOrderItems.id', 'serviceReferenceItems.orderItemId')
            .where({
                'serviceReferenceItemDetails.soldItemType': 'ServicePrices',
                'servicePrices.serviceId': id,
            })
            .andWhere('serviceOrderItems.status', '<>', 'CANCELLED');
        res.status(200).json({
            success: true,
            insights: {
                totalSold: Number(insights[0].totalSold),
                totalRevenue: Number(insights[0].totalRevenue),
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getInsights;
