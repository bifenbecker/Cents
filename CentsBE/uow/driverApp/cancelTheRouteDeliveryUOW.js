const { routeDeliveryStatuses } = require('../../constants/constants');

async function cancelTheRouteDeliveryUOW(payload) {
    try {
        const { routeDelivery, transaction, cancellationReason } = payload;
        if (!routeDelivery) {
            return payload;
        }
        await routeDelivery.$query(transaction).update({
            notes: cancellationReason,
            status: routeDeliveryStatuses.CANCELED,
        });

        return {
            ...payload,
            routeDelivery,
            id: routeDelivery.orderDelivery.id,
        };
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = cancelTheRouteDeliveryUOW;
