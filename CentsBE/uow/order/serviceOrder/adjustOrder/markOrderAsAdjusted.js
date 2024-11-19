const ServiceOrder = require('../../../../models/serviceOrders');

async function markOrderAsAdjusted(payload) {
    const { serviceOrder, transaction } = payload;
    await ServiceOrder.query(transaction).findById(serviceOrder.id).patch({
        isAdjusted: true,
    });
    return payload;
}
module.exports = exports = markOrderAsAdjusted;
