const Pipeline = require('../../pipeline');
const getRouteDetailsUow = require('../../../uow/driverApp/route/getRouteDetails');
const getRouteStoresDetailsUow = require('../../../uow/driverApp/route/getRouteStoresDetails');
const getoriginRouteUow = require('../../../uow/driverApp/route/getOriginRouteStoreUow');
/**
 * getRouteDetails
 * @param {Integer} routeId
 * @description Returns all detials about the route
 */
async function getRouteDetails(routeId) {
    const payload = {
        routeId,
    };
    const getRoutePipeline = new Pipeline([
        getRouteDetailsUow,
        getRouteStoresDetailsUow,
        getoriginRouteUow,
    ]);
    const result = await getRoutePipeline.run(payload);
    return result;
}

module.exports = getRouteDetails;
