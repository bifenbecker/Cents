const { raw } = require('objection');
const RouteDeliveries = require('../../../models/routeDeliveries');
const TeamMember = require('../../../models/teamMember');
const ServiceOrderRouteDeliveries = require('../../../models/serviceOrderRouteDeliveries');
const Route = require('../../../models/route');
const {
    serviceOrderRouteDeliveryStatuses,
    routeDeliveryStatuses,
} = require('../../../constants/constants');

async function pickupRoutesUow(payload) {
    const driver = await TeamMember.query(payload.transaction)
        .withGraphFetched('user(userModifier)')
        .modifiers({
            userModifier: (query) =>
                query.select('id', raw('concat(firstName, lastName)').as('employeeName')),
        })
        .findById(payload.driverId);

    const route = await Route.query(payload.transaction)
        .withGraphFetched('store.settings')
        .where('id', payload.routeId)
        .first();
    // Fetching online orders
    const onlineOrderRouteDeliveries = await RouteDeliveries.query(payload.transaction)
        .select('id', 'routeId', 'routableId', 'routableType', 'status', 'notes')
        .withGraphFetched('orderDelivery.order.serviceOrder')
        .where('routableType', 'OrderDelivery')
        .where('status', routeDeliveryStatuses.PICKED_UP)
        .where('routeId', payload.routeId);
    // Fetching Residential/Hub/spoke details
    const serviceOrderRouteDeliveries = await ServiceOrderRouteDeliveries.query(payload.transaction)
        .select()
        .withGraphFetched('routeDelivery(routeDeliveryModifier)')
        .modifiers({
            routeDeliveryModifier: (query) => query.select().where('routeId', payload.routeId),
        })
        .where('status', serviceOrderRouteDeliveryStatuses.PICKED_UP);

    const newPayload = payload;
    newPayload.driver = driver;
    newPayload.store = route.store;
    newPayload.pickupOrders = {
        onlineOrderRouteDeliveries,
        serviceOrderRouteDeliveries,
    };
    return newPayload;
}

module.exports = pickupRoutesUow;
