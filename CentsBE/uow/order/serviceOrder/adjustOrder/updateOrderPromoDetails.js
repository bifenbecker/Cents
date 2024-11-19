const Order = require('../../../../models/orders');

async function updateOrderPromoDetails(payload) {
    const { transaction, orderId, promotionId, promotionDetails } = payload;
    await Order.query(transaction).upsertGraph({
        id: orderId,
        promotionDetails: !promotionId ? null : promotionDetails,
    });
    return payload;
}

module.exports = exports = updateOrderPromoDetails;
