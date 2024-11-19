const InventoryItem = require('../../models/inventoryItem');

const updateProductPriceUow = async (payload) => {
    try {
        const { tierId, inventoryId, field, value } = payload;
        const isActiveProduct = await InventoryItem.query().findOne({
            pricingTierId: tierId,
            inventoryId,
        });
        if (isActiveProduct) {
            payload.updatedProductPrice = await InventoryItem.query()
                .patch({
                    [field]: value,
                    updatedAt: new Date().toISOString,
                })
                .findById(isActiveProduct.id)
                .returning('*');
        }
        return payload;
    } catch (error) {
        throw Error(error);
    }
};
module.exports = exports = updateProductPriceUow;
