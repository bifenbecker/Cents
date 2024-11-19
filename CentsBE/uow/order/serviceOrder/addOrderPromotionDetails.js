const OrderPromoDetail = require('../../../models/orderPromoDetail');

async function addOrderPromotionDetails(payload) {
    const {
        transaction,
        order: { id: orderId },
        promotionDetails,
        promotionId,
    } = payload;

    if (promotionId) {
        await OrderPromoDetail.query(transaction).insert({
            orderId,
            ...promotionDetails,
        });
    }

    return payload;
}

module.exports = exports = addOrderPromotionDetails;
