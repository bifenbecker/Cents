const InventoryItem = require('../../models/inventoryItem');

const createInventoryPricesUow = async (payload) => {
    try {
        const { inventoryPrices, transaction } = payload;

        if (inventoryPrices && inventoryPrices.length) {
            const prices = inventoryPrices.map((price) => ({
                ...price,
                pricingTierId: payload.id,
            }));
            await InventoryItem.query(transaction).insert(prices).returning('*');
        }
        const { id, name, type, businessId } = payload;
        return {
            id,
            name,
            type,
            businessId,
            ...payload,
        };
    } catch (error) {
        throw Error(error.message);
    }
};
module.exports = exports = createInventoryPricesUow;
