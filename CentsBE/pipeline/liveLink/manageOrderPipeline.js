const Pipeline = require('../pipeline');

const manageOrderUowMapper = require('../../utils/manageOrderUowMapper');
const eventEmitter = require('../../config/eventEmitter');

async function manageOrderPipeline(payload) {
    try {
        const uows = await manageOrderUowMapper(payload);
        const manageOrderPipeline = new Pipeline(uows);
        const output = await manageOrderPipeline.run(payload);
        if (output.isIntentDeliveryCreated || output.isIntentDeliveryUpdated) {
            // new INTENT_CREATED order delivery is created or INTENT_CREATED order delivery is updated
            eventEmitter.emit('intentCreatedOrderDelivery', {
                serviceOrderId: output.serviceOrderId,
                intentCreatedDelivery: output.delivery,
                storeTimezone: output.storeSettings.timeZone,
            });
        }
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = manageOrderPipeline;
