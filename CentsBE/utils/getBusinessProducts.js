const { raw } = require('objection');
const InventoryCategory = require('../models/inventoryCategory');

async function getProducts(businessId, transaction) {
    let products = transaction ? InventoryCategory.query(transaction) : InventoryCategory.query();
    products = products
        .select(
            'inventory.id as inventoryId',
            raw('coalesce(inventory.price, 0) as price'),
            raw('0 as quantity'),
            raw('true as "isFeatured"'),
        )
        .join('inventory', 'inventory.categoryId', 'inventoryCategories.id')
        .where('inventoryCategories.businessId', businessId)
        .andWhere('inventoryCategories.deletedAt', null)
        .andWhere('inventory.deletedAt', null);
    products = await products;
    return products;
}

module.exports = exports = getProducts;
