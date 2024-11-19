const Pipeline = require('../../pipeline');

// Uows
const updateServiceOrderStatus = require('../../../uow/superAdmin/serviceOrder/updateServiceOrderStatusUow');
const updateServiceOrderItemStatus = require('../../../uow/superAdmin/serviceOrder/updateServiceOrderItemStatusUow');
const createOrderActivityLog = require('../../../uow/createOrderActivityLogUOW');
const findScheduledOrderDeliveries = require('../../../uow/superAdmin/orderDeliveries/findScheduledOrderDeliveriesUow');
const cancelThirdPartyDeliveries = require('../../../uow/superAdmin/orderDeliveries/cancelThirdPartyDeliveriesUow');
const cancelOrderDeliveries = require('../../../uow/superAdmin/orderDeliveries/cancelOrderDeliveriesUow');

/**
 * Update the status of the ServiceOrder and the related ServiceOrderItem entries
 *
 * The pipeline contains the following units of work:
 *
 * 1) Update the status of the ServiceOrder model;
 * 2) Update the status of individual OrderItem models;
 * 3) Create OrderActivityLog entry for status change
 *
 * If incoming status is 'CANCELLED', then perform the following:
 *
 * 4) Find any pending deliveries for the order (either scheduled or in process)
 * 5) Cancel third party deliveries if necessary
 * 6) Cancel pending OrderDeliveries
 *
 * @param {Object} payload
 */
async function updateServiceOrderStatusPipeline(payload) {
    try {
        const serviceOrderPipeline = new Pipeline([
            updateServiceOrderStatus,
            updateServiceOrderItemStatus,
            createOrderActivityLog,
            findScheduledOrderDeliveries,
            cancelThirdPartyDeliveries,
            cancelOrderDeliveries,
        ]);
        const output = await serviceOrderPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderStatusPipeline;
