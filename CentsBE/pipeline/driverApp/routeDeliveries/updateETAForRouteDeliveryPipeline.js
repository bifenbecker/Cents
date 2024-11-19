const Pipeline = require('../../pipeline');

// Uows
const getRouteDeliveryInfo = require('../../../uow/driverApp/getRouteDeliveryInfo');

const updateETAForRouteDelivery = require('../../../uow/driverApp/route/updateETAForRouteDelivery');
const sendSMSforUpdatedEta = require('../../../uow/driverApp/route/sendSMSforUpdatedEta');

async function updateETAForRouteDeliveryPipeline(payload) {
    try {
        const pipeline = new Pipeline([
            getRouteDeliveryInfo,
            updateETAForRouteDelivery,
            sendSMSforUpdatedEta,
        ]);

        const output = await pipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = updateETAForRouteDeliveryPipeline;
