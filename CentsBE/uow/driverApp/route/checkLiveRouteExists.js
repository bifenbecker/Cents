const Route = require('../../../models/route');
const { routeStatuses } = require('../../../constants/constants');
const fetchCurrentStoreDetails = require('./getCurrentStoreDetailsUow');

/**
 * This function checks if the driver has a route in inprogress status
 * @param {Object} payload
 * @returns it throws a error if there is already inprogress route existing for the driver
 */
async function checkIfLiveRouteExists(payload) {
    const newPayload = payload;
    const { driverId, transaction, originStoreId } = payload;

    const currentLiveRoute = await Route.query(transaction)
        .where('driverId', driverId)
        .andWhere('status', routeStatuses.STARTED)
        .first();
    if (currentLiveRoute) {
        throw new Error('You already have a live route in progress');
    }
    const currentStore = await fetchCurrentStoreDetails(originStoreId, transaction);
    newPayload.currentStore = currentStore;
    newPayload.timezone = currentStore.settings.timeZone;

    return newPayload;
}

module.exports = exports = checkIfLiveRouteExists;
