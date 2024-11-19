const { raw } = require('objection');
const { orderDeliveryStatuses } = require('../../constants/constants');
const OrderDeliveries = require('../../models/orderDelivery');

const checkActiveOrderDeliveriesForZipCodes = async (payload) => {
    try {
        const { zipCodes, storeId, transaction } = payload;
        const newPayload = payload;
        const activeOrderDeliveries = await OrderDeliveries.query(transaction)
            .select(raw('distinct("postalCode")'))
            .whereNotIn('status', [
                orderDeliveryStatuses.CANCELED,
                orderDeliveryStatuses.COMPLETED,
                orderDeliveryStatuses.FAILED,
            ])
            .whereNull('deliveredAt')
            .where('storeId', storeId)
            .whereIn('postalCode', zipCodes);
        const activeOrderZipCodes = activeOrderDeliveries.map(
            (orderDelivery) => orderDelivery.postalCode,
        );
        newPayload.zipCodesForDelivery = activeOrderZipCodes || [];
        return newPayload;
    } catch (error) {
        throw Error(error);
    }
};

module.exports = exports = checkActiveOrderDeliveriesForZipCodes;
