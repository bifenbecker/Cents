const OrderPromoDetail = require('../../models/orderPromoDetail');

/**
 * Use incoming payload to create an OrderPromoDetail model.
 *
 * We do not currently assign itemIds since the ServiceReferenceItemDetail model
 * is not populated until intake is complete
 *
 * @param {Object} payload
 */
async function createOrderPromoDetail(payload) {
    try {
        const newPayload = payload;
        const { transaction, promotion, order } = newPayload;

        if (!promotion) return newPayload;

        const orderPromoDetail = await OrderPromoDetail.query(transaction).insert({
            orderId: order.id,
            promoDetails: promotion,
            orderableType: order.orderableType,
            itemIds: [],
        });

        newPayload.orderPromoDetail = orderPromoDetail;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createOrderPromoDetail;
