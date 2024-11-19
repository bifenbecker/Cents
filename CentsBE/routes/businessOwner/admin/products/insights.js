const { raw } = require('objection');
const InventoryItem = require('../../../../models/inventoryItem');

/**
 * @description  Selected Individual Service Insights:
 * Total Sold(#)
 * Revenue($)
 * Total on Hand(#) - inventory
 */
async function getInsights(req, res, next) {
    try {
        const { id } = req.params;

        const insights = await InventoryItem.query()
            .select(
                raw(`
            sum("serviceReferenceItems".quantity) as "totalSold",
            sum("inventoryItems".price * "serviceReferenceItems".quantity) as "revenue"
            `),
            )
            .join(
                'serviceReferenceItems',
                'serviceReferenceItems.inventoryItemId',
                'inventoryItems.id',
            )
            .join('serviceOrderItems', 'serviceOrderItems.id', 'serviceReferenceItems.orderItemId')
            .where('inventoryItems.inventoryId', id)
            .andWhere('serviceOrderItems.status', '<>', 'CANCELLED');
        const inHand = await InventoryItem.query().sum({ totalInHand: 'quantity' }).where({
            inventoryId: id,
            deletedAt: null,
        });
        res.status(200).json({
            insights: {
                totalSold: Number(insights[0].totalSold),
                revenue: Number(insights[0].revenue),
                totalInHand: Number(inHand[0].totalInHand),
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getInsights;
