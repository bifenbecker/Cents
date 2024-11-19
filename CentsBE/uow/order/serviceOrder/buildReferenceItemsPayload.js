const mapServiceReferenceItemDetail = require('../../../routes/employeeTab/washAndFold/mapServiceReferenceItemDetail');
const ServicePrices = require('../../../models/servicePrices');
const InventoryItem = require('../../../models/inventoryItem');
const ServiceOrderItem = require('../../../models/serviceOrderItem');
const { getPrice } = require('./priceCalculations');

async function priceDetails(priceId, lineItemType, transaction) {
    let itemModel;
    if (lineItemType === 'SERVICE') {
        itemModel = ServicePrices;
    } else {
        itemModel = InventoryItem;
    }
    const itemDetails = await itemModel.query(transaction).findById(priceId);
    return itemDetails;
}

async function referenceItemForExistingItems(orderItemId, referenceItem, transaction) {
    const serviceOrderItem = await ServiceOrderItem.query(transaction)
        .findById(orderItemId)
        .withGraphJoined('referenceItems.[lineItemDetail]');
    referenceItem.id = serviceOrderItem.referenceItems[0].id;
    referenceItem.orderItemId = orderItemId;

    referenceItem.lineItemDetail.id = serviceOrderItem.referenceItems[0].lineItemDetail.id;
    referenceItem.lineItemDetail.serviceReferenceItemId = serviceOrderItem.referenceItems[0].id;
}

async function serviceReferenceItem(payload) {
    const { transaction, item: orderItem, customer, chargeableWeight, totalWeight } = payload;
    const { priceId, lineItemType, count, modifiers = [] } = orderItem;
    const { minPrice = 0 } = await priceDetails(priceId, lineItemType, transaction);
    const totalPrice = await getPrice({ ...orderItem, chargeableWeight, totalWeight });
    const referenceItem = {
        quantity: count,
        unitCost: minPrice,
        totalPrice,
    };
    referenceItem[lineItemType === 'SERVICE' ? 'servicePriceId' : 'inventoryItemId'] = priceId;
    referenceItem.lineItemDetail = await mapServiceReferenceItemDetail(
        referenceItem,
        customer,
        modifiers,
    );

    if (orderItem.id) {
        await referenceItemForExistingItems(orderItem.id, referenceItem, transaction);
    }
    return [referenceItem];
}

async function modifierReferenceItem(modifier, customer, transaction) {
    const referenceItem = {
        serviceModifierId: modifier.serviceModifierId,
        quantity: Number(modifier.weight),
        unitCost: modifier.price,
        totalPrice: Number(modifier.weight) * Number(modifier.price),
        lineItemDetail: {
            soldItemType: 'Modifier',
            lineItemName: modifier.name,
            lineItemUnitCost: modifier.price,
            lineItemDescription: modifier.description,
            soldItemId: modifier.serviceModifierId,
            lineItemQuantity: Number(modifier.weight),
            lineItemTotalCost: Number(
                (Number(modifier.weight) * Number(modifier.price)).toFixed(2),
            ),
            customerName: customer.fullName,
            customerPhoneNumber: customer.phoneNumber,
            pricingType: modifier?.pricingType,
        },
    };
    if (modifier.id) {
        await referenceItemForExistingItems(modifier.id, referenceItem, transaction);
    }
    return [referenceItem];
}

async function buildReferenceItemsPayload(payload) {
    const { transaction, customer, totalWeight, chargeableWeight } = payload;
    payload.serviceOrderItems = await Promise.all(
        payload.serviceOrderItems.map(async (item) => {
            if (item.lineItemType === 'MODIFIER') {
                item.referenceItems = await modifierReferenceItem(item, customer);
            } else {
                item.referenceItems = await serviceReferenceItem({
                    item,
                    customer,
                    transaction,
                    totalWeight,
                    chargeableWeight,
                });
            }
            return item;
        }),
    );
    return payload;
}

module.exports = exports = buildReferenceItemsPayload;
