const Pipeline = require('../../pipeline');
const createRouteUow = require('../../../uow/driverApp/route/createRouteUow');
const checkIfLiveRouteExists = require('../../../uow/driverApp/route/checkLiveRouteExists');
const {
    validateOrderDeliveriesAvailability,
    validateStoreDeliveriesAvailability,
} = require('../../../uow/driverApp/route/routeDeliveriesValidation');
const { createRouteDeliveryUow } = require('../../../uow/driverApp/route/createRouteDeliveryUow');
const startRouteDeliveryUow = require('../../../uow/driverApp/route/startRouteDeliveryUow');
/**
 *
 * @param {Object} payload
 */
async function createRoutePipeline(payload) {
    const routeCreationPipeline = new Pipeline([
        checkIfLiveRouteExists,
        validateOrderDeliveriesAvailability,
        validateStoreDeliveriesAvailability,
        createRouteUow,
        createRouteDeliveryUow,
        startRouteDeliveryUow,
    ]);
    const result = await routeCreationPipeline.run(payload);
    return result.routeId;
}
module.exports = exports = createRoutePipeline;
