const Pipeline = require('../../pipeline');

// Uows
const updateOrderDeliveryStatus = require('../../../uow/superAdmin/orderDeliveries/updateOrderDeliveryStatusUow');
const cancelIndividualThirdPartyDelivery = require('../../../uow/superAdmin/orderDeliveries/cancelIndividualThirdPartyDeliveryUow');

/**
 * Update the status of the OrderDelivery
 *
 * The pipeline contains the following units of work:
 *
 * 1) Update the status of the OrderDelivery model;
 *
 * If incoming status is 'CANCELED', then perform the following:
 *
 * 2) Find any pending third party deliveries for the order (either scheduled or in process)
 * 3) Cancel third party deliveries if necessary
 *
 * @param {Object} payload
 */
async function updateOrderDeliveryStatusPipeline(payload) {
    try {
        const orderDeliveryPipeline = new Pipeline([
            updateOrderDeliveryStatus,
            cancelIndividualThirdPartyDelivery,
        ]);
        const output = await orderDeliveryPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderDeliveryStatusPipeline;
