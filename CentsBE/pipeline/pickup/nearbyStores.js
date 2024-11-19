const Pipeline = require('../pipeline');

const generateDoorDashPickupEstimate = require('../../uow/delivery/doordash/generateDoorDashPickupEstimateUow');
const findNearStores = require('../../uow/delivery/pickup/findNearStores');
const { formatResponse } = require('../../uow/delivery/pickup/formatResponse');
const ownDeliveryWindows = require('../../uow/delivery/pickup/findOwnDeliveryWindows');
const onDemandDeliveryWindows = require('../../uow/delivery/pickup/findOnDemandDeliveryWindow');

async function findNearbyStores(payload) {
    try {
        const subscriptionPipeline = new Pipeline([
            findNearStores,
            ownDeliveryWindows,
            generateDoorDashPickupEstimate,
            onDemandDeliveryWindows,
            formatResponse,
        ]);
        const output = await subscriptionPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = findNearbyStores;
