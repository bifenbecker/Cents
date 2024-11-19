const ServiceOrderRouteDelivery = require('../../../models/serviceOrderRouteDeliveries');
const {
    hubOrderRouteDeliveryTypes: deliveryTypes,
    statuses,
    serviceOrderRouteDeliveryStatuses: deliveryStatuses,
    routeDeliveryStatuses,
    orderSmsEvents,
} = require('../../../constants/constants');
const ServiceOrderBags = require('../../../models/serviceOrderBags');
const updateServiceOrderStatus = require('../route/updateServiceOrderStatus');
const RouteDelivery = require('../../../models/routeDeliveries');
const eventEmitter = require('../../../config/eventEmitter');

async function updateServiceOrderBagsStatus(serviceOrderId, status, transaction) {
    await ServiceOrderBags.query(transaction)
        .patch({
            barcodeStatus: status,
            isActiveBarcode: !(status === 'CANCELLED' || status === 'COMPLETED'),
        })
        .where('serviceOrderId', serviceOrderId);
}

async function createServiceOrderRouteDelivery(payload) {
    const { serviceOrderId, routeDeliveryId, overriddenScan, transaction, isCurrentStoreHub } =
        payload;
    await ServiceOrderRouteDelivery.query(transaction).insert({
        serviceOrderId,
        routeDeliveryId,
        overriddenScan,
        status: deliveryStatuses.PICKED_UP,
        type: isCurrentStoreHub ? deliveryTypes.TO_HUB : deliveryTypes.TO_STORE,
    });
}

async function updateServiceOrderRouteDelivery(payload) {
    const { serviceOrderId, routeDeliveryId, transaction } = payload;
    await ServiceOrderRouteDelivery.query(transaction)
        .patch({
            status: deliveryStatuses.DROPPED_OFF,
        })
        .where('serviceOrderId', serviceOrderId)
        .andWhere('routeDeliveryId', routeDeliveryId);
}

async function updateStatusesForOrder(serviceOrderStatus, payload) {
    const { serviceOrderId, driverId, transaction } = payload;
    await updateServiceOrderStatus([serviceOrderId], serviceOrderStatus, driverId, transaction);
    await updateServiceOrderBagsStatus(serviceOrderId, serviceOrderStatus, transaction);
}

async function StatusForResidentialStore(payload) {
    const { routeDeliveryId, transaction } = payload;
    const routeDeliveryDetails = await RouteDelivery.query(transaction)
        .withGraphJoined('[store]')
        .where('routeDeliveries.id', routeDeliveryId)
        .first();
    if (routeDeliveryDetails.completedAt === null) {
        await routeDeliveryDetails.$query(transaction).patch({
            completedAt: new Date().toISOString(),
            status: routeDeliveryStatuses.COMPLETED,
        });
    }
    const isResidential = routeDeliveryDetails.store.type === 'RESIDENTIAL';
    if (isResidential) {
        const status = statuses.COMPLETED;
        await updateStatusesForOrder(status, payload);
    }
}

async function completeStoreServiceOrderUow(payload) {
    const newPayload = payload;
    const { type, isCurrentStoreHub, serviceOrderId } = payload;
    let serviceOrderStatus = '';
    switch (type) {
        case 'PICKUP':
            await createServiceOrderRouteDelivery(payload);
            serviceOrderStatus = isCurrentStoreHub
                ? statuses.IN_TRANSIT_TO_HUB
                : statuses.IN_TRANSIT_TO_STORE;
            await updateStatusesForOrder(serviceOrderStatus, payload);
            break;
        default:
            await updateServiceOrderRouteDelivery(payload);
            serviceOrderStatus = isCurrentStoreHub
                ? statuses.DROPPED_OFF_AT_STORE
                : statuses.DROPPED_OFF_AT_HUB;
            await updateStatusesForOrder(serviceOrderStatus, payload);
            // update the status of order to completed
            // check if routableId(storeId) is residential then serviceOrder.status = completed
            await StatusForResidentialStore(payload);
            eventEmitter.emit(
                'orderSmsNotification',
                orderSmsEvents.DROPPED_OFF_AT_STORE,
                serviceOrderId,
            );
            break;
    }
    return newPayload;
}
module.exports = exports = completeStoreServiceOrderUow;
