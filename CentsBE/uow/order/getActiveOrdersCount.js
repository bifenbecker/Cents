const ServiceOrder = require('../../models/serviceOrders');
const InventoryOrder = require('../../models/inventoryOrders');

const getActiveOrdersCount = async (payload) => {
    try {
        const { storeId, transaction } = payload;

        const activeServiceOrdersCount = await ServiceOrder.query(transaction)
            .where('storeId', storeId)
            .whereNotIn('status', ['CANCELLED', 'CANCELED', 'COMPLETED'])
            .count()
            .first();

        const activeInventoryOrdersCount = await InventoryOrder.query(transaction)
            .where('storeId', storeId)
            .whereNotIn('status', ['CANCELLED', 'CANCELED', 'COMPLETED'])
            .count()
            .first();

        const totalActiveOrdersCount =
            Number(activeServiceOrdersCount.count) + Number(activeInventoryOrdersCount.count);
        payload.totalActiveOrdersCount = totalActiveOrdersCount;
        return payload;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = exports = getActiveOrdersCount;
