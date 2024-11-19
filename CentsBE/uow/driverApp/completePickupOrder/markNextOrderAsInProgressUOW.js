const RouteDelivery = require('../../../models/routeDeliveries');
const { routeDeliveryStatuses } = require('../../../constants/constants');
const RouteDeliveryActivityLog = require('../../../models/routeDeliveryActivityLog');
/**
 * update a status to 'IN_PROGRESS' for next pickUp and Delivery order
 *
 * @param {Object} payload
 */
async function updateNextOrderAsInProgress(payload) {
    try {
        const newPayload = payload;
        const { transaction, routeDelivery, driverId } = newPayload;

        if (!routeDelivery) {
            return newPayload;
        }

        /* fetch the next stop which are ready for
        the pickup Or Delivery which are of type OrderDelivery */
        const query = `select * from "routeDeliveries" where "routeId" =${routeDelivery.routeId}
         and "stopNumber" > ${routeDelivery.stopNumber} and (status = '${routeDeliveryStatuses.ASSIGNED}' OR status is null) and "routableType" = 'OrderDelivery' order by "stopNumber" limit 1`;

        const routeDeliveries = await RouteDelivery.query(transaction).knex().raw(query);

        if (routeDeliveries.rows.length) {
            await RouteDelivery.query(transaction)
                .patch({
                    status: routeDeliveryStatuses.IN_PROGRESS,
                    startedAt: new Date().toISOString(),
                })
                .findById(routeDeliveries.rows[0].id);

            await RouteDeliveryActivityLog.query(transaction).insert({
                status: routeDeliveryStatuses.IN_PROGRESS,
                driverId,
                routeDeliveryId: routeDeliveries.rows[0].id,
            });
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateNextOrderAsInProgress;
