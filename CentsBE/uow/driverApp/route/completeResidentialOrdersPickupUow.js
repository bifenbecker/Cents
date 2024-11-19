const ServiceOrders = require('../../../models/serviceOrders');
const RouteDeliveries = require('../../../models/routeDeliveries');
const orderActivityLog = require('../../../models/orderActivityLog');
const ServiceOrderRouteDelivery = require('../../../models/serviceOrderRouteDeliveries');
const ServiceOrderBags = require('../../../models/serviceOrderBags');
const {
    statuses,
    routeDeliveryStatuses,
    serviceOrderRouteDeliveryStatuses,
    hubOrderRouteDeliveryTypes,
    origins,
} = require('../../../constants/constants');
const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

async function updateOrderAndOrderActivityLogs(serviceOrderRouteDelivery, payload) {
    const serviceOrderStatus =
        serviceOrderRouteDelivery.type === hubOrderRouteDeliveryTypes.TO_HUB
            ? statuses.DROPPED_OFF_AT_HUB
            : statuses.DROPPED_OFF_AT_STORE;
    await ServiceOrders.query(payload.transaction)
        .patch({
            status: serviceOrderStatus,
        })
        .where({ id: serviceOrderRouteDelivery.serviceOrderId });

    await ServiceOrderBags.query(payload.transaction)
        .patch({
            barcodeStatus: serviceOrderStatus,
        })
        .where({ serviceOrderId: serviceOrderRouteDelivery.serviceOrderId });

    await ServiceOrderRouteDelivery.query(payload.transaction)
        .patch({
            status: serviceOrderRouteDeliveryStatuses.DROPPED_OFF,
        })
        .where({ serviceOrderId: serviceOrderRouteDelivery.serviceOrderId })
        .where({ status: serviceOrderRouteDeliveryStatuses.PICKED_UP });

    await orderActivityLog.query(payload.transaction).insert({
        orderId: serviceOrderRouteDelivery.serviceOrderId,
        status: serviceOrderStatus,
        teamMemberId: payload.driver.id,
        employeeCode: payload.driver.employeeCode,
        employeeName: payload.driver.employeeName,
        origin: origins.DRIVER_APP,
    });
    return true;
}

async function completeResidentialOrdersPickup(payload) {
    try {
        // TODO: Complete residential orders
        if (!payload.pickupOrders.serviceOrderRouteDeliveries.length) {
            return payload;
        }
        await Promise.all(
            payload.pickupOrders.serviceOrderRouteDeliveries.map((ele) =>
                updateOrderAndOrderActivityLogs(ele, payload),
            ),
        );
        await RouteDeliveries.query(payload.transaction)
            .patch({ status: routeDeliveryStatuses.COMPLETED })
            .where('routeId', payload.routeId)
            .where('routableType', 'Store');
        return payload;
    } catch (err) {
        LoggerHandler(
            'error',
            `Error in Complete Residential Order Pickups Uow:: ${JSON.stringify(err)}`,
            payload,
        );
        throw err;
    }
}

module.exports = completeResidentialOrdersPickup;
