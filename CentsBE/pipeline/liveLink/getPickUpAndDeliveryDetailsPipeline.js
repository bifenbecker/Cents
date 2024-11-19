const pickupAndDeliveryDetails = require('../../uow/liveLink/serviceOrders/pickupAndDeliveryDetails');
const Pipeline = require('../pipeline');

// Uows

async function getPickUpAndDeliveryDetailsPipeline(payload) {
    try {
        const pickupAndDeliveryPipeline = new Pipeline([pickupAndDeliveryDetails]);
        const output = await pickupAndDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getPickUpAndDeliveryDetailsPipeline;
