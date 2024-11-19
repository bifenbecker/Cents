const { raw } = require('objection');

async function getRoutesForShiftsUOW(payload) {
    try {
        const { todaysShiftsTimings, storeTimezone, transaction, teamMemberId, storeId } = payload;

        const sqlPromises = [...todaysShiftsTimings].map((timing) => {
            if (!timing.id) {
                return Promise.resolve(true);
            }
            return timing
                .$fetchGraph(
                    '[routes.routeDeliveries.[orderDelivery, store, serviceOrderRouteDeliveries],shift]',
                    { transaction },
                )
                .modifyGraph('shift', (builder) => builder.select('id', 'name'))
                .modifyGraph('routes', (builder) =>
                    builder
                        .where('driverId', teamMemberId)
                        .where('storeId', storeId)
                        .where(
                            raw(
                                `(route."createdAt" at time zone '${storeTimezone}')::date  = (now() at time zone '${storeTimezone}')::date`,
                            ),
                        )
                        .orderBy('updatedAt', 'desc')
                        .limit(1),
                )
                .modifyGraph('routes.routeDeliveries', (builder) => {
                    builder
                        .where((query) => {
                            query.where('routableType', 'Store').whereNot('routableId', storeId);
                        })
                        .orWhere('routableType', 'OrderDelivery');
                });
        });

        await Promise.all(sqlPromises);

        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getRoutesForShiftsUOW;
