const { getStoreServicesInline, getModifiers } = require('../../../services/washServices/queries');
const { getProductsQuery } = require('../../../services/queries/getProductsQuery');
const orderInventoryItemDetails = require('../../../services/inventory/orderInventoryItemDetails');
const TierLookup = require('../../../queryHelpers/tierLookup');

async function validateServiceOrderModifiers(serviceOrderModifierIds, businessId, transaction) {
    const modifiers = await getModifiers(businessId, transaction);
    for (const i of serviceOrderModifierIds) {
        const modifier = modifiers.find((modifier) => i === modifier.serviceModifierId);
        if (!modifier) {
            throw new Error('Modifier not found');
        }
        if (!modifier.isFeatured) {
            throw new Error(`${modifier.name} is not available.`);
        }
    }
}

async function validateServiceItems(serviceItems, payload, tierId) {
    const {
        store: { id: storeId, businessId },
        transaction,
        skipPerPoundChargeableWeightValidation = false,
        version,
    } = payload;
    const storeServices = await getStoreServicesInline(storeId, tierId, transaction, version);
    for (const i of serviceItems) {
        const storeService = storeServices.find((storeService) => storeService.id === i.priceId);
        if (!storeService) {
            throw new Error('service not found.');
        }
        i.serviceMasterId = storeService.serviceId;
        i.minimumPrice = storeService.minPrice;
        i.minimumQuantity = storeService.minQty;
        i.perItemPrice = storeService.storePrice;
        i.lineItemName = storeService.serviceName;
        i.hasMinPrice = storeService.hasMinPrice;
        i.pricingType = storeService?.pricingType;
        i.serviceCategoryType = storeService?.serviceCategoryType;

        // if there is a minimum quantity associated with the storeService,
        // then the ordered quantity should be always greater than that.
        if (storeService?.pricingType === 'PER_POUND') {
            // minimum quantity and minimum price are only
            // associated with PER_POUND storeServices.
            if (!i.weight && !skipPerPoundChargeableWeightValidation && !i.isDeleted) {
                throw new Error(`Weight measurement is required for ${storeService.serviceName}.`);
            }
            if (i.serviceModifierIds && i.serviceModifierIds.length) {
                // validate modifier.
                await validateServiceOrderModifiers(i.serviceModifierIds, businessId, transaction);
            }
        }
    }
}

async function validateInventoryItems(
    inventoryOrderItems,
    storeId,
    tierId,
    serviceOrderId,
    transaction,
) {
    const uniqueInventoryItems = [...new Set(inventoryOrderItems.map((item) => item.priceId))];
    if (inventoryOrderItems.length !== uniqueInventoryItems.length) {
        throw new Error('Duplicate products found in the order.');
    }
    let inventoryItems = [];

    if (tierId) inventoryItems = await getProductsQuery(transaction, storeId, null, tierId);
    else inventoryItems = await getProductsQuery(transaction, storeId);

    const items = [];
    for (const i of inventoryOrderItems) {
        const inventoryItem = inventoryItems.find((product) => product.id === i.priceId);
        if (!inventoryItem) {
            throw new Error('Inventory item not found.');
        }

        if (inventoryItem.quantity - i.count < 0 && !i.id) {
            throw new Error(`Available quantity for ${inventoryItem.productName} is ${inventoryItem.quantity}.
             Please update the order quantity for ${inventoryItem.productName}`);
        }
        const item = {
            ...i,
            perItemPrice: inventoryItem.price,
            lineItemName: inventoryItem.productName,
            lineItemDescription: inventoryItem.description,
            inventoryItemId: inventoryItem.id,
            changeInQuantity: -i.count,
            inventoryMasterId: inventoryItem.inventoryId,
        };
        if (i.id) {
            const serviceOrderItem = await orderInventoryItemDetails(
                serviceOrderId,
                inventoryItem.id,
                transaction,
            );
            item.changeInQuantity = serviceOrderItem.referenceItems[0].quantity - i.count;
            if (i.isDeleted) {
                item.changeInQuantity = serviceOrderItem.referenceItems[0].quantity;
            }
        }
        items.push(item);
    }
    return items;
}
async function validateServiceOrderItems(payload) {
    const { orderItems, store, transaction, serviceOrderId, centsCustomerId } = payload;
    const newPayload = payload;
    const serviceItems = orderItems.filter((item) => item.lineItemType === 'SERVICE');
    let inventoryItems = orderItems.filter((item) => item.lineItemType === 'INVENTORY');

    const tierLookup = new TierLookup(serviceOrderId, centsCustomerId, store.businessId);
    const tierId = await tierLookup.tierId();

    if (serviceItems.length) {
        await validateServiceItems(serviceItems, payload, tierId);
    }
    if (inventoryItems.length) {
        inventoryItems = await validateInventoryItems(
            inventoryItems,
            store.id,
            tierId,
            serviceOrderId,
            transaction,
        );
    }
    newPayload.orderItems = serviceItems.concat(inventoryItems);
    newPayload.inventoryOrderItems = inventoryItems;
    return newPayload;
}

module.exports = {
    validateServiceOrderItems,
    validateInventoryItems,
};
