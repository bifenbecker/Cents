const RouteDelivery = require('../../../models/routeDeliveries');
const fetchCurrentStoreDetails = require('../route/getCurrentStoreDetailsUow');

async function getStoreIdOfRoute(payload) {
    const { transaction, routeDeliveryId } = payload;
    const newPayload = payload;
    const routeDelivery = await RouteDelivery.query(transaction)
        .withGraphJoined('[route]')
        .where('routeDeliveries.id', routeDeliveryId)
        .first();
    const { storeId } = routeDelivery.route;
    const storeDetails = await fetchCurrentStoreDetails(storeId, transaction);
    newPayload.isCurrentStoreHub = storeDetails.isHub;
    return newPayload;
}

module.exports = exports = getStoreIdOfRoute;
