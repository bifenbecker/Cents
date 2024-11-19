const _ = require('lodash');
const RouteDelivery = require('../../../models/routeDeliveries');

const mappedOrder = (routeDelivery) => ({
    id: routeDelivery.id,
    status: routeDelivery.status,
    eta: routeDelivery.eta,
    notes: routeDelivery.notes,
    imageUrl: routeDelivery.imageUrl,
    route: {
        id: routeDelivery.route.id,
        status: routeDelivery.route.status,
        driver: {
            firstName: routeDelivery.route.driver.user.firstname,
            lastName: routeDelivery.route.driver.user.lastname,
            phoneNumber: routeDelivery.route.driver.user.phone,
        },
    },
});

async function routeDeliveryDetails(payload) {
    const { routableId } = payload;
    const routeDelivery = await RouteDelivery.query()
        .where(`${RouteDelivery.tableName}.routableId`, routableId)
        .andWhere(`${RouteDelivery.tableName}.routableType`, 'OrderDelivery')
        .withGraphJoined('[route.[driver.[user(user)]]]')
        .modifiers({
            user: (query) => {
                query.select('firstname', 'lastname', 'phone');
            },
        })
        .first();
    if (_.isEmpty(routeDelivery)) {
        return {};
    }
    return mappedOrder(routeDelivery);
}
module.exports = exports = routeDeliveryDetails;
