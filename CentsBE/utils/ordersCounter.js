const OrderCount = require('../models/businessOrderCount');

async function getOrderCount(businessId, trx) {
    const count = await OrderCount.query(trx)
        .select()
        .forUpdate()
        .where({
            businessId,
        })
        .first();
    return count ? Number(count.totalOrders) : 0;
}

async function updateOrderCount(businessId, count, trx) {
    await OrderCount.query(trx)
        .patch({
            totalOrders: count + 1,
        })
        .findOne({
            businessId,
        });
}

module.exports = exports = {
    getOrderCount,
    updateOrderCount,
};
