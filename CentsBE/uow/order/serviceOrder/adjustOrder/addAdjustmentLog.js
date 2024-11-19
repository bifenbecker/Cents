const OrderAdjustmentBuilder = require('../../../../services/orders/builders/adjustmentLogs/base');
const OrderAdjustmentLog = require('../../../../models/orderAdjustmentLog');

async function addAdjustmentLog(payload) {
    const {
        netOrderTotal,
        creditAmount,
        orderTotal,
        employee,
        notes,
        promotionId,
        currentOrderDetails,
        serviceOrderId,
    } = payload;
    const adjustmentLogsBuilder = new OrderAdjustmentBuilder(
        {
            id: serviceOrderId,
            notes,
            ...currentOrderDetails,
            promotionId,
        },
        employee,
        {
            netOrderTotal,
            creditAmount,
            orderTotal,
        },
    );
    await OrderAdjustmentLog.query(this.transaction).insert(adjustmentLogsBuilder.build());
    return payload;
}

module.exports = exports = addAdjustmentLog;
