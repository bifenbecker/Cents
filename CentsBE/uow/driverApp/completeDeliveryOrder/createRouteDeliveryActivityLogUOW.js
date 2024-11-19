const RouteDeliveryActivityLog = require('../../../models/routeDeliveryActivityLog');

/**
 * update a status to routeDeliveryStatus for routeDeliveryActivityLog
 *
 * @param {Object} payload
 */
async function createRouteDeliveryActivityLog(payload) {
    try {
        const newPayload = payload;
        const { transaction, driverId, updatedRouteDelivery } = newPayload;

        await RouteDeliveryActivityLog.query(transaction).insert({
            driverId,
            routeDeliveryId: updatedRouteDelivery.id,
            status: updatedRouteDelivery.status,
        });

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createRouteDeliveryActivityLog;
