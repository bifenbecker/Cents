const Pipeline = require('../../pipeline');
const completeOnlineOrderPickupsUow = require('../../../uow/driverApp/route/completeOnlineOrderPickupUow');
const completeResidentialOrderPickupsUow = require('../../../uow/driverApp/route/completeResidentialOrdersPickupUow');
const pickupRoutesUow = require('../../../uow/driverApp/route/pickupRoutesUow');
const completeRouteUow = require('../../../uow/driverApp/route/completeRouteUow');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function completeRoutePipeline(payload) {
    try {
        const completeRoute = new Pipeline([
            pickupRoutesUow,
            completeOnlineOrderPickupsUow,
            completeResidentialOrderPickupsUow,
            completeRouteUow,
        ]);
        const result = await completeRoute.run(payload);
        return result;
    } catch (err) {
        LoggerHandler('error', err, payload);
        throw err;
    }
}

module.exports = completeRoutePipeline;
