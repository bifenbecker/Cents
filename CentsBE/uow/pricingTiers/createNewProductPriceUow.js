const InventoryItem = require('../../models/inventoryItem');

const createNewProductPriceUow = async (payload) => {
    try {
        const { tierId, inventoryId, field, value } = payload;

        const productPrice = {
            inventoryId,
            price: field === 'price' ? value : 0,
            quantity: field === 'quantity' ? value : 0,
            isFeatured: field === 'isFeatured' ? value : true,
            isTaxable: field === 'isTaxable' ? value : true,
            pricingTierId: tierId,
        };
        payload.newProductPrice = await InventoryItem.query().insert(productPrice).returning('*');
        return payload;
    } catch (error) {
        throw Error(error);
    }
};
module.exports = exports = createNewProductPriceUow;
