const Pipeline = require('../../pipeline');

// Uows
const getRouteDeliveryInfo = require('../../../uow/driverApp/getRouteDeliveryInfo');
const getRouteDetailsUow = require('../../../uow/driverApp/route/getRouteDetails');
const getRouteStoresDetailsUow = require('../../../uow/driverApp/route/getRouteStoresDetails');
const getOriginRouteUow = require('../../../uow/driverApp/route/getOriginRouteStoreUow');

async function getRouteDeliveryInfoPipeline(payload) {
    try {
        const pipeline = new Pipeline([
            getRouteDeliveryInfo,
            getRouteDetailsUow,
            getRouteStoresDetailsUow,
            getOriginRouteUow,
        ]);

        const output = await pipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = getRouteDeliveryInfoPipeline;
