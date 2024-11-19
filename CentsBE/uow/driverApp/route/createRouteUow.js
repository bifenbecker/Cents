const Route = require('../../../models/route');
const { routeStatuses } = require('../../../constants/constants');

/**
 * @description This function creats a record in Route table for the live route
 * @param {Object} payload
 * @returns it return the input payload along with the created route id
 */
async function createRouteUow(payload) {
    const newPayload = payload;
    const routePayload = {
        storeId: payload.originStoreId,
        driverId: payload.driverId,
        timingId: payload.shiftTimingId,
        status: routeStatuses.STARTED,
        startedAt: new Date().toISOString(),
    };
    const createdRoute = await Route.query(payload.transaction).insert(routePayload).returning('*');
    newPayload.routeId = createdRoute.id;
    return newPayload;
}
module.exports = exports = createRouteUow;
