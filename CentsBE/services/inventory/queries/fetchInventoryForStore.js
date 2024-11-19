const { raw } = require('objection');
const { map, uniq } = require('lodash');
const InventoryItem = require('../../../models/inventoryItem');
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const TierLookup = require('../../../queryHelpers/tierLookup');

/**
 * Fetch a list of products for a given store
 *
 * @param {Object} store
 * @param {Number} centsCustomerId
 * @param {Number} businessId
 */
async function fetchInventoryForStore(store, orderId, centsCustomerId) {
    const { id, businessId } = store;
    // No need to check for delivery tier for inventory orders
    const tierLookup = new TierLookup(orderId, centsCustomerId, businessId);
    const tierId = await tierLookup.tierId();

    let inventoryPrice = InventoryItem.query()
        .select(
            'inventoryItems.id as priceId',
            raw('coalesce("inventoryItems".price, 0) as price'),
            'inventoryItems.storeId as storeId',
            'inventory.productName as lineItemName',
            'inventory.productImage as inventoryImage',
            'inventory.description as description',
            'inventoryCategories.name as inventoryCategory',
            'inventory.isTaxable',
            raw('\'INVENTORY\' as "lineItemType"'),
            'inventory.id as productId',
            'inventory.isDeleted as isArchived',
        )
        .join('inventory', 'inventory.id', 'inventoryItems.inventoryId')
        .join('inventoryCategories', 'inventoryCategories.id', 'inventory.categoryId')
        .where({
            'inventoryCategories.businessId': businessId,
            'inventoryItems.isFeatured': true,
            'inventoryItems.deletedAt': null,
            'inventory.deletedAt': null,
        });

    inventoryPrice = tierId
        ? inventoryPrice
        : inventoryPrice
              .select('inventoryItems.quantity as quantity')
              .andWhere('inventoryItems.quantity', '>', 0);

    if (tierId) {
        inventoryPrice
            .select('storeInventoryItems.quantity as quantity')
            .join('inventoryItems AS storeInventoryItems', (builder) => {
                builder
                    .on('storeInventoryItems.inventoryId', '=', 'inventoryItems.inventoryId')
                    .andOn('storeInventoryItems.storeId', '=', id)
                    .andOn('storeInventoryItems.quantity', '>', 0)
                    .andOnNull('storeInventoryItems.deletedAt');
            })
            .where('inventoryItems.pricingTierId', tierId);
    } else if (orderId) {
        inventoryPrice
            .union((query) => {
                query
                    .select(
                        'inventoryItems.id as priceId',
                        raw('coalesce("inventoryItems".price, 0) as price'),
                        'inventoryItems.storeId as storeId',
                        'inventory.productName as lineItemName',
                        'inventory.productImage as inventoryImage',
                        'inventory.description as description',
                        'inventoryCategories.name as inventoryCategory',
                        'inventory.isTaxable',
                        raw('\'INVENTORY\' as "lineItemType"'),
                        'inventory.id as productId',
                        'inventory.isDeleted as isArchived',
                        'inventoryItems.quantity as quantity',
                    )
                    .from(`${ServiceOrderItem.tableName}`)
                    .join('serviceReferenceItems', (builder) => {
                        builder
                            .on('serviceOrderItems.id', '=', 'serviceReferenceItems.orderItemId')
                            .andOn('serviceOrderItems.orderId', Number(orderId))
                            .onNull('serviceOrderItems.deletedAt');
                    })
                    .join(
                        'inventoryItems',
                        'inventoryItems.id',
                        'serviceReferenceItems.inventoryItemId',
                    )
                    .join('inventory', 'inventory.id', 'inventoryItems.inventoryId')
                    .join('inventoryCategories', 'inventoryCategories.id', 'inventory.categoryId');
            })
            .where('storeId', raw(`(select "storeId" from "serviceOrders" where id = ${orderId})`));
    } else {
        inventoryPrice.where('storeId', id);
    }

    inventoryPrice = inventoryPrice.orderBy('lineItemName', 'asc');
    inventoryPrice = await inventoryPrice;
    let categories = map(inventoryPrice, 'inventoryCategory');
    categories = uniq(categories);
    categories.unshift('All');

    return [inventoryPrice, categories];
}

module.exports = exports = { fetchInventoryForStore };
