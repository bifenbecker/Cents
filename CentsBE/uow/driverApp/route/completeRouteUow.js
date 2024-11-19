const moment = require('moment-timezone');
const { raw } = require('objection');
const Route = require('../../../models/route');
const { routeStatuses, routeDeliveryStatuses } = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function completeRoute(payload) {
    try {
        await Route.query(payload.transaction)
            .patch({
                status: routeStatuses.COMPLETED,
                completedAt: new Date().toISOString(),
            })
            .where('id', payload.routeId);
        let residentialPickupStatus;
        let residentialDeliveryStatus;
        if (payload.store.isHub) {
            residentialPickupStatus = 'TO_HUB';
            residentialDeliveryStatus = 'TO_STORE';
        } else {
            residentialPickupStatus = 'TO_STORE';
            residentialDeliveryStatus = 'TO_HUB';
        }
        const pickupsTotalQuery = `(SELECT COUNT(rd.*) FROM "routeDeliveries" rd INNER JOIN "orderDeliveries" od ON 
        rd."routableId" = od.id AND rd."routableType"='OrderDelivery' WHERE od."type"='PICKUP' AND rd."routeId"="route".id)::INTEGER`;
        const pickupsCompletedQuery = `(SELECT COUNT(rd.*) FROM "routeDeliveries" rd INNER JOIN "orderDeliveries" od ON 
        rd."routableId" = od.id AND rd."routableType"='OrderDelivery' WHERE od."type"='PICKUP' AND rd."status"='${routeDeliveryStatuses.COMPLETED}' AND rd."routeId"="route".id)::INTEGER`;
        const deliveryTotalQuery = `(SELECT COUNT(rd.*) FROM "routeDeliveries" rd INNER JOIN "orderDeliveries" od ON 
        rd."routableId" = od.id AND rd."routableType"='OrderDelivery' WHERE od."type"='RETURN' AND rd."routeId"="route".id)::INTEGER`;
        const deliveryCompletedQuery = `(SELECT COUNT(rd.*) FROM "routeDeliveries" rd INNER JOIN "orderDeliveries" od ON 
        rd."routableId" = od.id AND rd."routableType"='OrderDelivery' WHERE od."type"='RETURN' AND rd."status"='COMPLETED' AND rd."routeId"="route".id)::INTEGER`;
        const residentialPickupsCount = `(SELECT COUNT(srd.*) FROM "routeDeliveries" rd INNER JOIN  "serviceOrderRouteDeliveries" srd ON srd."routeDeliveryId"=rd.id 
            WHERE "type"='${residentialPickupStatus}' AND "rd"."routeId"="route".id)::INTEGER`;
        const residentialDeliveriesCount = `(SELECT COUNT(srd.*) FROM "routeDeliveries" rd INNER JOIN  "serviceOrderRouteDeliveries" srd ON srd."routeDeliveryId"=rd.id 
            WHERE "type"='${residentialDeliveryStatus}' AND "rd"."routeId"="route".id)::INTEGER`;
        const route = await Route.query(payload.transaction)
            .select(
                'id',
                'completedAt',
                'createdAt',
                'startedAt',
                'status',
                raw(pickupsTotalQuery).as('pickupsTotal'),
                raw(pickupsCompletedQuery).as('pickupsCompleted'),
                raw(deliveryTotalQuery).as('deliveryTotal'),
                raw(deliveryCompletedQuery).as('deliveryCompleted'),
                raw(residentialPickupsCount).as('residentialPickupsCount'),
                raw(residentialDeliveriesCount).as('residentialDeliveriesCount'),
            )
            .findById(payload.routeId);
        const startedAt = moment(route.startedAt).tz(payload.store.settings.timeZone);
        const completedAt = moment(route.completedAt).tz(payload.store.settings.timeZone);
        const hours = completedAt.diff(startedAt, 'hours');
        const minutes = completedAt.diff(startedAt, 'minutes') % 60;
        route.duration = `${hours} hours, ${minutes} minutes`;
        route.completedAt = completedAt.format('MM/DD/YY, h:mm a');
        route.startedAt = startedAt.format('MM/DD/YY, h:mm a');
        route.pickupsTotal += route.residentialPickupsCount;
        route.deliveryTotal += route.residentialDeliveriesCount;
        route.pickupsCompleted += route.residentialPickupsCount;
        route.deliveryCompleted += route.residentialDeliveriesCount;
        delete route.residentialPickupsCount;
        delete route.residentialDeliveriesCount;
        return route;
    } catch (err) {
        LoggerHandler('error', `Error in Complete Route UOW ${JSON.stringify(err)}`, payload);
        throw err;
    }
}

module.exports = completeRoute;
