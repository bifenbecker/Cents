const RouteDelivery = require('../../../models/routeDeliveries');
const { routeDeliveryStatuses } = require('../../../constants/constants');

/**
 * update a status to 'COMPLETED' for routeDelivery
 *
 * @param {Object} payload
 */
async function updateRouteDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, routeDeliveryId, notes, imageUrl } = newPayload;

        const updatedRouteDelivery = await RouteDelivery.query(transaction)
            .patch({
                status: routeDeliveryStatuses.COMPLETED,
                notes,
                imageUrl,
                completedAt: new Date().toISOString(),
            })
            .findById(routeDeliveryId)
            .returning('*');

        newPayload.updatedRouteDelivery = updatedRouteDelivery;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateRouteDelivery;
