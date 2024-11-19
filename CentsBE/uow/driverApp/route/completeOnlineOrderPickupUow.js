const _ = require('lodash');
const RouteDelivery = require('../../../models/routeDeliveries');
const OrderDelivery = require('../../../models/orderDelivery');
const ServiceOrders = require('../../../models/serviceOrders');
const ServiceOrderBags = require('../../../models/serviceOrderBags');
const {
    routeDeliveryStatuses,
    orderDeliveryStatuses,
    statuses,
    origins,
} = require('../../../constants/constants');
const orderActivityLog = require('../../../models/orderActivityLog');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function completeOnlineOrderPickup(payload) {
    try {
        if (!payload.pickupOrders.onlineOrderRouteDeliveries.length) {
            return payload;
        }

        // TODO: Write complete online order pickup
        const routeDeliveryIds = _.map(payload.pickupOrders.onlineOrderRouteDeliveries, 'id');
        const orderDeliveryIds = _.map(
            payload.pickupOrders.onlineOrderRouteDeliveries,
            'orderDelivery.id',
        );
        const serviceOrderIds = _.map(
            payload.pickupOrders.onlineOrderRouteDeliveries,
            'orderDelivery.order.serviceOrder.id',
        );

        // Update status in route Deliveries
        await RouteDelivery.query(payload.transaction)
            .update({ status: routeDeliveryStatuses.COMPLETED })
            .whereIn('id', routeDeliveryIds);

        // Update status Order Deliveries
        await OrderDelivery.query(payload.transaction)
            .update({ status: orderDeliveryStatuses.COMPLETED })
            .whereIn('id', orderDeliveryIds);

        // Update status in Orders
        await ServiceOrders.query(payload.transaction)
            .update({ status: statuses.READY_FOR_INTAKE })
            .whereIn('id', serviceOrderIds);

        // ServiceOrderBags
        await ServiceOrderBags.query(payload.transaction)
            .update({ barcodeStatus: statuses.READY_FOR_INTAKE })
            .whereIn('serviceOrderId', serviceOrderIds);
        // INSERT INTO ORDER ACTIVITY LOGS
        const orderActivityLogs = payload.pickupOrders.onlineOrderRouteDeliveries.map(
            (routeDelivery) =>
                orderActivityLog.query(payload.transaction).insert({
                    orderId: routeDelivery.orderDelivery.order.serviceOrder.id,
                    status: statuses.READY_FOR_INTAKE,
                    notes: routeDelivery.note,
                    teamMemberId: payload.driver.id,
                    employeeCode: payload.driver.employeeCode,
                    employeeName: payload.driver.user.employeeName,
                    origin: origins.DRIVER_APP,
                }),
        );
        await Promise.all(orderActivityLogs);
        return payload;
    } catch (err) {
        LoggerHandler(
            'error',
            `Error in Complete Online order pickup UOW::${JSON.stringify(err)}`,
            payload,
        );
        throw err;
    }
}

module.exports = completeOnlineOrderPickup;
