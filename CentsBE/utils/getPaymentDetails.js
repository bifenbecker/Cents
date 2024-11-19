const Order = require('../models/orders');

async function getPaymentsForOrder(id, orderableType) {
    let details = Order.query()
        .select('orders.id as orderId', 'payments.*')
        .join('payments', 'payments.orderId', 'orders.id')
        .where('orderableId', id);
    if (orderableType === 'InventoryOrder') {
        details = details.andWhere('orderableType', 'InventoryOrder');
    } else {
        details = details.where('orderableType', 'ilike', 'serviceOrder');
    }
    details = await details;
    return details;
}

module.exports = exports = getPaymentsForOrder;
