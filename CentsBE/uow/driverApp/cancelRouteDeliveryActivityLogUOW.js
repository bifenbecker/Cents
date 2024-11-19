const { routeDeliveryStatuses } = require('../../constants/constants');
const RouteDeliveryActivityLog = require('../../models/routeDeliveryActivityLog');

async function cancelRouteDeliveryActivityLogUOW(payload) {
    try {
        const { routeDelivery, transaction, driverId } = payload;

        if (!routeDelivery) {
            return payload;
        }

        await RouteDeliveryActivityLog.query(transaction).insert({
            driverId,
            routeDeliveryId: routeDelivery.id,
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

module.exports = cancelRouteDeliveryActivityLogUOW;
