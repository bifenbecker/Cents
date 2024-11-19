const InventoryCategory = require('../../models/inventoryCategory');

async function getProductsQuery(transaction, storeId, businessId, tierId, isFeatured) {
    let products = InventoryCategory.query(transaction);

    products = tierId
        ? products.select(
              'inventoryItems.id as id',
              'inventory.productName',
              'inventory.productImage',
              'inventory.description',
              'inventoryItems.price as price',
              'inventoryItems.isFeatured as isFeatured',
              'inventory.id as inventoryId',
              'inventory.isDeleted as isDeleted',
          )
        : products.select(
              'inventoryItems.id as id',
              'inventory.productName',
              'inventory.productImage',
              'inventory.description',
              'inventoryItems.quantity as quantity',
              'inventoryItems.price as price',
              'inventoryItems.isFeatured as isFeatured',
              'inventoryItems.isTaxable as isTaxable',
              'inventory.id as inventoryId',
              'inventoryItems.storeId as storeId',
              'inventory.isDeleted as isDeleted',
          );

    products
        .join('inventory', 'inventory.categoryId', 'inventoryCategories.id')
        .join('inventoryItems', 'inventoryItems.inventoryId', 'inventory.id');

    products =
        tierId && storeId
            ? products
                  .select('storeInventoryItems.quantity as quantity')
                  .join('inventoryItems AS storeInventoryItems', (builder) => {
                      builder
                          .on('storeInventoryItems.inventoryId', '=', 'inventoryItems.inventoryId')
                          .andOn('storeInventoryItems.storeId', '=', storeId);
                  })
            : products;

    if (tierId) {
        products = products.andWhere('inventoryItems.pricingTierId', tierId);
    } else if (businessId) {
        products = products.andWhere('inventoryCategories.businessId', businessId);
    } else {
        products = products.andWhere('inventoryItems.storeId', storeId);
    }

    products = isFeatured ? products.andWhere('inventoryItems.isFeatured', true) : products;
    products = await products;
    return products;
}

module.exports = exports = {
    getProductsQuery,
};
