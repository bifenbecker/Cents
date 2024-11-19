const { createInventoryPayload, createServicePayload } = require('./serviceOrderTestHelper');

async function fixedPriceServiceItemPayload(store, centsCustomer, customerSelection = false) {
    const { servicePrice: fixedServicePrice, serviceMaster: fixedService } =
        await createServicePayload(store);
    return {
        status: 'READY_FOR_PROCESSING',
        price: 10,
        customerSelection: customerSelection,
        referenceItems: [
            {
                quantity: 1,
                unitCost: 10,
                totalPrice: 10,
                servicePriceId: fixedServicePrice.id,
                lineItemDetail: {
                    soldItemId: fixedServicePrice.id,
                    soldItemType: 'ServicePrices',
                    lineItemName: fixedService.name,
                    lineItemDescription: fixedService.description,
                    lineItemTotalCost: 10,
                    lineItemQuantity: 1,
                    lineItemUnitCost: 10,
                    lineItemMinPrice: 10,
                    lineItemMinQuantity: 1,
                    customerName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
                    customerPhoneNumber: centsCustomer.phoneNumber,
                    category: 'FIXED_PRICE',
                },
            },
        ],
    };
}

async function perPoundServiceItemPayload(store, centsCustomer, customerSelection = false) {
    const {
        servicePrice: perPoundServicePrice,
        serviceMaster: perPoundService,
        serviceModifier,
    } = await createServicePayload(store, 'PER_POUND');
    return {
        status: 'READY_FOR_PROCESSING',
        price: 10,
        customerSelection: customerSelection,
        referenceItems: [
            {
                quantity: 1,
                unitCost: 10,
                totalPrice: 10,
                servicePriceId: perPoundServicePrice.id,
                serviceModifierId: serviceModifier.id,
                lineItemDetail: {
                    soldItemId: perPoundServicePrice.id,
                    soldItemType: 'ServicePrices',
                    lineItemName: perPoundService.name,
                    lineItemDescription: perPoundService.description,
                    lineItemTotalCost: 10,
                    lineItemQuantity: 1,
                    lineItemUnitCost: 10,
                    lineItemMinPrice: 10,
                    lineItemMinQuantity: 1,
                    customerName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
                    customerPhoneNumber: centsCustomer.phoneNumber,
                    category: 'PER_POUND',
                },
            },
        ],
    };
}

async function perPoundModifierItemPayload(store, centsCustomer, customerSelection = false) {
    const { serviceModifier, modifier } = await createServicePayload(store, 'PER_POUND');
    return {
        status: 'READY_FOR_PROCESSING',
        price: 10,
        customerSelection: customerSelection,
        referenceItems: [
            {
                serviceModifierId: serviceModifier.id,
                quantity: Number(modifier.weight),
                unitCost: modifier.price,
                totalPrice: Number(modifier.weight) * Number(modifier.price),
                lineItemDetail: [
                    {
                        soldItemType: 'Modifier',
                        lineItemName: modifier.name,
                        lineItemUnitCost: modifier.price,
                        lineItemDescription: modifier.description,
                        soldItemId: serviceModifier.id,
                        lineItemQuantity: Number(modifier.weight),
                        lineItemTotalCost: Number(
                            (Number(modifier.weight) * Number(modifier.price)).toFixed(2),
                        ),
                        customerName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
                        customerPhoneNumber: centsCustomer.phoneNumber,
                    },
                ],
            },
        ],
    };
}

async function inventoryItemPayload(
    store,
    centsCustomer,
    customerSelection = false,
    inventoryItemQuantity = 1,
) {
    const { inventoryItem, inventory } = await createInventoryPayload(store);
    return {
        status: 'READY_FOR_PROCESSING',
        price: 10,
        customerSelection: customerSelection,
        referenceItems: [
            {
                quantity: inventoryItemQuantity,
                unitCost: 10,
                totalPrice: 10,
                inventoryItemId: inventoryItem.id,
                lineItemDetail: {
                    soldItemId: inventoryItem.id,
                    soldItemType: 'InventoryItem',
                    lineItemName: inventory.productName,
                    lineItemDescription: inventory.description,
                    lineItemTotalCost: 10,
                    lineItemQuantity: 1,
                    lineItemUnitCost: 10,
                    lineItemMinPrice: 10,
                    lineItemMinQuantity: 1,
                    customerName: `${centsCustomer.firstName} ${centsCustomer.lastName}`,
                    customerPhoneNumber: centsCustomer.phoneNumber,
                    category: 'FIXED_PRICE',
                },
            },
        ],
    };
}

module.exports = {
    fixedPriceServiceItemPayload,
    perPoundServiceItemPayload,
    perPoundModifierItemPayload,
    inventoryItemPayload,
};
