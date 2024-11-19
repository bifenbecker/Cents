const formatCurrency = require('../formatCurrency');

/**
 * Format each inventory order with appropriate details for front-end
 *
 * @param {Object} inventoryOrder
 */
async function mapInventoryOrderData(inventoryOrder) {
    const mappedData = {};

    mappedData.id = inventoryOrder.id;
    mappedData.orderCode = inventoryOrder.orderCode;
    mappedData.storeName = inventoryOrder.store.name;
    mappedData.customerName = inventoryOrder.customer
        ? `${inventoryOrder.customer.firstName} ${inventoryOrder.customer.lastName}`
        : '--';
    mappedData.status = inventoryOrder.status;
    mappedData.orderTotal = await formatCurrency(inventoryOrder.orderTotal);
    mappedData.createdAt = inventoryOrder.createdAt;
    mappedData.updatedAt = inventoryOrder.updatedAt;
    mappedData.orderTotal = await formatCurrency(inventoryOrder.orderTotal);
    if (inventoryOrder.order) {
        mappedData.paymentMethod = inventoryOrder.order.payments[0]
            ? inventoryOrder.order.payments[0].paymentProcessor
            : null;
    }
    mappedData.paymentStatus = inventoryOrder.paymentStatus;
    mappedData.tipAmount = await formatCurrency(inventoryOrder.tipAmount);
    mappedData.creditAmount = await formatCurrency(inventoryOrder.creditAmount);
    mappedData.promotionAmount = await formatCurrency(inventoryOrder.promotionAmount);
    mappedData.businessName = inventoryOrder.store.laundromatBusiness.name;

    return mappedData;
}

module.exports = exports = mapInventoryOrderData;
