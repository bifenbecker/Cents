const InventoryCategory = require('../models/inventoryCategory');
const InventoryItem = require('../models/inventoryItem');

async function getProductDetails(id, businessId) {
    const product = await InventoryCategory.query()
        .join('inventory', 'inventory.categoryId', 'inventoryCategories.id')
        .where('inventoryCategories.businessId', businessId)
        .andWhere('inventory.id', id)
        .andWhere('inventory.deletedAt', null)
        .andWhere('inventoryCategories.deletedAt', null)
        .first();
    return product;
}
async function getFeaturedProducts(pricingTierId) {
    const featuredProducts = await InventoryItem.query().where({
        pricingTierId,
        isFeatured: true,
        deletedAt: null,
    });
    return featuredProducts;
}
module.exports = exports = {
    getProductDetails,
    getFeaturedProducts,
};
