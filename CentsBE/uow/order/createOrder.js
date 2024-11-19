const Order = require('../../models/orders');

async function createOrder(payload) {
    try {
        const newPayload = payload;
        const {
            inventoryOrder,
            store: { id: storeId },
            transaction,
            orderType,
            serviceOrder,
        } = payload;
        const orderableId = orderType === 'InventoryOrder' ? inventoryOrder.id : serviceOrder.id;
        const orderableType = orderType === 'InventoryOrder' ? 'InventoryOrder' : 'ServiceOrder';
        const order = await Order.query(transaction)
            .insert({
                storeId,
                orderableId,
                orderableType,
            })
            .returning('*');
        newPayload.order = order;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = createOrder;
