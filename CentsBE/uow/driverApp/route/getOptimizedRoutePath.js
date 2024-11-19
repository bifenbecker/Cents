const DistanceAndDurationService = require('../../../services/google/distanceAndDurationService');

/**
 * This function takes origin and destinations address
 * arrays and returns the optimized distance path
 * @param {Array} originAddress
 * @param {Array} destinationAddress
 * @returns optimized route from origin to destination
 */
async function getGoogleDistancePath(originAddress, destinationAddress, routeDeliveryStops, tz) {
    const googleDistanceMatrix = new DistanceAndDurationService(
        originAddress,
        destinationAddress,
        tz,
    );
    const optimizedRoute = await googleDistanceMatrix.fetchDistanceAndDuration();
    const routeDeliveries = [];
    for (let index = 0; index < routeDeliveryStops.length; index++) {
        const path = optimizedRoute.find((route) => route.lat === routeDeliveryStops[index].lat);
        routeDeliveries.push({
            ...routeDeliveryStops[index],
            eta: path.estimatedTimeArrival,
        });
    }
    return routeDeliveries
        .sort((a, b) => a.eta - b.eta)
        .map((stop, index) => ({
            ...stop,
            stopNumber: index + 1,
        }));
}
module.exports = exports = getGoogleDistancePath;
