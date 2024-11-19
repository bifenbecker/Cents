const formatCurrency = require('../formatCurrency');

/**
 * Format each service order with appropriate details for front-end
 *
 * @param {Object} serviceOrder
 */
async function mapServiceOrderData(serviceOrder) {
    const mappedData = {};

    mappedData.id = serviceOrder.id;
    mappedData.orderCode = serviceOrder.orderCode;
    mappedData.storeName = serviceOrder.store.name;
    mappedData.customerName = serviceOrder.storeCustomer
        ? `${serviceOrder.storeCustomer.firstName} ${serviceOrder.storeCustomer.lastName}`
        : '--';
    mappedData.status = serviceOrder.status;
    mappedData.orderTotal = await formatCurrency(serviceOrder.orderTotal);
    mappedData.netOrderTotal = await formatCurrency(serviceOrder.netOrderTotal);
    mappedData.placedAt = serviceOrder.placedAt;
    mappedData.completedAt = serviceOrder.completedAt;
    mappedData.paymentStatus = serviceOrder.paymentStatus;
    mappedData.paymentTiming = serviceOrder.paymentTiming;
    mappedData.tipAmount = await formatCurrency(serviceOrder.tipAmount);
    mappedData.creditAmount = await formatCurrency(serviceOrder.creditAmount);
    mappedData.promotionAmount = await formatCurrency(serviceOrder.promotionAmount);
    mappedData.balanceDue = await formatCurrency(serviceOrder.balanceDue);

    return mappedData;
}

module.exports = exports = mapServiceOrderData;
