const Pipeline = require('../../pipeline');

// Uows
const getShiftsForStoreUOW = require('../../../uow/driverApp/getShiftsForStoreUOW');
const getRoutesForShiftsUOW = require('../../../uow/driverApp/getRoutesForShiftsUOW');
const getDeliveryAndPickupCount = require('../../../uow/driverApp/getDeliveryAndPickupCountUOW');
const getResidentialAndHubSpokeOrderCount = require('../../../uow/driverApp/getResidentialAndHubSpokeOrderCount');
const getPastPendingRoutesUow = require('../../../uow/driverApp/getPastPendingRoutesUow');

async function getShiftsForStorePipeline(payload) {
    try {
        const storePipeline = new Pipeline([
            getShiftsForStoreUOW,
            getRoutesForShiftsUOW,
            getDeliveryAndPickupCount,
            getResidentialAndHubSpokeOrderCount,
            getPastPendingRoutesUow,
        ]);
        const output = await storePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = getShiftsForStorePipeline;
