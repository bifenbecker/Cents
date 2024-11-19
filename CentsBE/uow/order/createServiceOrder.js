const { paymentTimings } = require('../../constants/constants');
const ServiceOrder = require('../../models/serviceOrders');
const { getOrderCount, updateOrderCount } = require('../../utils/ordersCounter');

async function createServiceOrder(payload) {
    try {
        const newPayload = payload;
        const {
            storeCustomerId,
            hubId,
            storeId,
            transaction,
            orderNotes,
            businessId,
            status,
            orderType,
            isProcessedAtHub,
            isBagTrackingEnabled,
            paymentTiming,
            promotion,
            returnMethod = '',
            tierId,
            hasDryCleaning,
            turnAroundInHours,
        } = payload;
        // Remove once it is working fine
        const orderCount = await getOrderCount(businessId, transaction);
        const orderCode = 1000 + orderCount + 1;
        const serviceOrder = await ServiceOrder.query(transaction)
            .insertGraph({
                orderTotal: 0,
                netOrderTotal: 0,
                storeId,
                status,
                isProcessedAtHub,
                notes: orderNotes,
                hubId,
                isBagTrackingEnabled,
                paymentTiming: paymentTiming || paymentTimings['POST-PAY'],
                orderCode,
                storeCustomerId,
                orderType,
                returnMethod,
                activityLog: {
                    status,
                    notes: orderNotes || null,
                    updatedAt: new Date().toISOString(),
                    origin: newPayload.origin,
                },
                promotionId: promotion ? promotion.id : null,
                tierId,
                hasDryCleaning: hasDryCleaning || false,
                turnAroundInHours,
            })
            .returning('*');

        await updateOrderCount(businessId, orderCount, transaction);

        newPayload.serviceOrder = serviceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = createServiceOrder;
