const Inventory = require('../../../../models/inventory');

async function getProductQuery(id) {
    const product = await Inventory.query()
        .where({
            'inventory.id': id,
        })
        .eagerAlgorithm(Inventory.JoinEagerAlgorithm)
        .eager('inventoryItems(itemsFilter).[store(storeName)]', {
            storeName: (query) => {
                query.select('name');
            },
            itemsFilter: (query) => {
                query.where('deletedAt', null).whereNot({
                    storeId: null,
                });
            },
        })
        .orderBy('inventoryItems:store.name', 'asc');
    return product;
}

module.exports = exports = getProductQuery;
