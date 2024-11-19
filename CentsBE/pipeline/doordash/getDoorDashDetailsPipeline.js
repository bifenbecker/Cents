const Pipeline = require('../pipeline');

// Uows
const getDoorDashDeliveryDetails = require('../../uow/doorDash/getDoorDashDeliveryDetails');

async function getDoorDashDeliveryDetailsPipeline(payload) {
    try {
        const doorDashDeliveryPipeline = new Pipeline([getDoorDashDeliveryDetails]);
        const output = await doorDashDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getDoorDashDeliveryDetailsPipeline;
