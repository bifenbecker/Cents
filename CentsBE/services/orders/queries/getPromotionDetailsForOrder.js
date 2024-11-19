const Order = require('../../../models/orders');

async function getOrderPromoDetails(orderableId, orderableType, transaction) {
    const orderPromoDetails = await Order.query(transaction)
        .withGraphJoined('promotionDetails')
        .where('orders.orderableId', orderableId)
        .andWhere('orders.orderableType', orderableType)
        .first();
    return orderPromoDetails;
}
module.exports = exports = getOrderPromoDetails;
