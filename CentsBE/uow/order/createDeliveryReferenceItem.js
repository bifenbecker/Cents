const ServiceReferenceItem = require('../../models/serviceReferenceItem');

function mapReferenceItem(deliveryServiceOrderItem, deliveryService, orderDelivery, storeCustomer) {
    const referenceItem = {
        orderItemId: deliveryServiceOrderItem.id,
        quantity: 1,
        totalPrice: orderDelivery.totalDeliveryCost,
        unitCost: orderDelivery.totalDeliveryCost, // unitCost * quantity = totalPrice.
        servicePriceId: deliveryService.servicePriceId,
        lineItemDetail: {
            soldItemType: 'ServicePrices',
            soldItemId: deliveryService.servicePriceId,
            lineItemName: deliveryService.name,
            lineItemDescription: deliveryService.description,
            lineItemQuantity: 1,
            lineItemUnitCost: orderDelivery.totalDeliveryCost,
            lineItemMinPrice: null,
            lineItemMinQuantity: null,
            lineItemTotalCost: orderDelivery.totalDeliveryCost,
            customerName: `${storeCustomer.firstName} ${storeCustomer.lastName}`,
            customerPhoneNumber: storeCustomer.phoneNumber,
            category: 'DELIVERY',
        },
    };
    return referenceItem;
}

async function createDeliveryOrderItem(payload) {
    try {
        const {
            transaction,
            deliveryServiceOrderItem,
            deliveryService,
            storeCustomer,
            orderDelivery,
        } = payload;
        const referenceItem = mapReferenceItem(
            deliveryServiceOrderItem,
            deliveryService,
            orderDelivery,
            storeCustomer,
        );
        const deliveryServiceReferenceItem = await ServiceReferenceItem.query(transaction)
            .insertGraph([referenceItem])
            .returning('*');
        const { lineItemDetail: deliveryLineItem } = deliveryServiceReferenceItem;
        const newPayload = payload;
        newPayload.deliveryServiceReferenceItem = deliveryServiceReferenceItem;
        newPayload.deliveryLineItem = deliveryLineItem;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = createDeliveryOrderItem;
