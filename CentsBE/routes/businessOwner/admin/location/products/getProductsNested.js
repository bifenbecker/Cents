const InventoryCategory = require('../../../../../models/inventoryCategory');

async function getProducts(req, res, next) {
    try {
        const { id } = req.params;
        const products = await InventoryCategory.query()
            .select('inventoryCategories.id', 'inventoryCategories.name')
            .withGraphJoined('[inventory(inventoryFilter).[inventoryItems(itemsFilter)]]')
            .modifiers({
                inventoryFilter: (query) => {
                    query
                        .select('id', 'productName as name', 'description', 'price')
                        .where('deletedAt', null);
                },
                itemsFilter: (query) => {
                    query
                        .select('id', 'storeId', 'price', 'quantity', 'isFeatured', 'updatedAt')
                        .where('deletedAt', null)
                        .andWhere('storeId', id);
                },
            })
            .where('inventory:inventoryItems.storeId', id);
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getProducts;
