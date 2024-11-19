const moment = require('moment-timezone');
const Route = require('../../models/route');
const { routeStatuses } = require('../../constants/constants');

async function getPastPendingRoutesUow(payload) {
    const newPayload = payload;
    const { todaysShiftsTimings, transaction, teamMemberId, storeTimezone, store, storeId } =
        newPayload;

    const todaysRoute = todaysShiftsTimings.find(
        (shift) => (shift.routes && shift.routes.length) || shift.route,
    );
    if (!todaysRoute) {
        const pendingRoute = await Route.query(transaction)
            .where('route.driverId', teamMemberId)
            .andWhere('route.storeId', storeId)
            .whereNot('route.status', routeStatuses.COMPLETED)
            .withGraphJoined('[timing.shift, routeDeliveries.[orderDelivery, store]]')
            .first();
        if (!pendingRoute) {
            return newPayload;
        }
        const { timingId, routeDeliveries, timing } = pendingRoute;
        const startTime = moment.utc(timing.startTime);
        const endTime = moment.utc(timing.endTime);
        const routeCreatedAt = moment(pendingRoute.createdAt).tz(storeTimezone);
        const deliveryCount = routeDeliveries
            .filter((rd) => rd.orderDelivery)
            .filter((rd) => rd.orderDelivery.type === 'RETURN').length;
        const pickupCount = routeDeliveries
            .filter((rd) => rd.orderDelivery)
            .filter((rd) => rd.orderDelivery.type === 'PICKUP').length;
        newPayload.past = {
            route: {
                id: pendingRoute.id,
                storeId: pendingRoute.storeId,
                timingId: pendingRoute.timingId,
                driverId: pendingRoute.driverId,
                status: pendingRoute.status,
                startedAt: pendingRoute.startedAt,
                completedAt: pendingRoute.completedAt,
                createdAt: pendingRoute.createdAt,
                updatedAt: pendingRoute.updatedAt,
                onlineOrdersCount: deliveryCount + pickupCount,
                residentialStoresCount: routeDeliveries
                    .filter((rd) => rd.store)
                    .filter((rd) => !rd.store.isHub).length,
                hubSpokeStoresCount: routeDeliveries
                    .filter((rd) => rd.store)
                    .filter((rd) => rd.store.isHub).length,
            },
            window: `${routeCreatedAt.format('ddd MM/DD')} ${startTime.format(
                'h:mm A',
            )} - ${endTime.format('h:mm A')}`,
            date: routeCreatedAt.format('MM/DD/YYYY'),
            shiftTimingId: timingId,
            shiftName: pendingRoute.timing.shift.name,
            isHub: store.isHub,
        };
    }
    return newPayload;
}

module.exports = exports = getPastPendingRoutesUow;
