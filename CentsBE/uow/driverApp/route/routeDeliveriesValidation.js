const RouteDelivery = require('../../../models/routeDeliveries');
const { routeDeliveryStatuses } = require('../../../constants/constants');
const storeStopsUOW = require('../storeStopsUOW');
const { pickUpConfirmedOrdersForDeliveryUOW } = require('../pickUpConfirmedOrdersForDeliveryUOW');

/**
 * this function validates if the selected orderDeliveryIds for the route are available or not
 * it throws an error if the stops are in inprogress or completed status
 * @param {Object} payload
 * @returns the payload if no error else returns the error
 */
async function validateOrderDeliveriesAvailability(payload) {
    const newPayload = payload;
    const { orderDeliveryIds, transaction } = payload;
    if (orderDeliveryIds && orderDeliveryIds.length) {
        let filteredIds = [];
        const unAvailableDeliveries = await RouteDelivery.query(transaction)
            .whereIn('routableId', orderDeliveryIds)
            .andWhere('routableType', 'OrderDelivery')
            .whereIn('status', [routeDeliveryStatuses.ASSIGNED, routeDeliveryStatuses.COMPLETED])
            .returning('routeDeliveries.routableId');
        if (unAvailableDeliveries.length) {
            const unAvailableIds = unAvailableDeliveries.map((delivery) => delivery.routableId);
            filteredIds = orderDeliveryIds.filter((id) => !unAvailableIds.includes(id));
            newPayload.orderDeliveryIds = filteredIds;
        }
    }
    return newPayload;
}

const validateDeliveryOrdersOfStores = async ({
    transaction,
    storeIds,
    originStoreId,
    filteredStores,
}) => {
    // fetching the orders available for delivey for the stores
    const { stores } = await pickUpConfirmedOrdersForDeliveryUOW({
        transaction,
        storeIds,
        originStoreId,
    });
    const validatedStores = filteredStores;
    for (let i = 0; i < filteredStores.length; i++) {
        const { deliveryOrders } = filteredStores[i];
        if (deliveryOrders && deliveryOrders.length) {
            // finding the delivery orders of the store selected for routing
            const { orders: serviceOrders = [] } = stores.find(
                (store) => store.id === filteredStores[i].storeId,
            );
            if (serviceOrders.length) {
                const orderIds = serviceOrders.map((serviceOrder) => serviceOrder.id);
                // filtering the orders available for delivery for store
                validatedStores[i].deliveryOrders = deliveryOrders.filter((deliveryOrder) =>
                    orderIds.includes(deliveryOrder.serviceOrderId),
                );
            } else {
                // if no delivery orders are there then resetting the deliveryOrders as empty array
                validatedStores[i].deliveryOrders = [];
            }
        }
    }
    return validatedStores;
};

async function getValidatedStores(newPayload) {
    const { stores, transaction, originStoreId } = newPayload;
    // fetching the storestops available for the origin
    const { storeStops } = await storeStopsUOW(newPayload);
    if (storeStops.length) {
        // filtering the storeStops with has either pickups or deliveries
        const storesWithPickupOrDeliveries = storeStops
            .filter((store) => store.pickupCount > 0 || store.deliveryCount > 0)
            .map((store) => store.storeId);
        if (storesWithPickupOrDeliveries.length) {
            // filtering the available stores selected for creating route based
            // on if they have either pickups or deliveries
            const filteredStores = stores.filter((store) =>
                storesWithPickupOrDeliveries.includes(store.storeId),
            );
            if (filteredStores.length) {
                const storeIds = filteredStores.map((store) => store.storeId);
                if (storeIds.length) {
                    // validating the deliveryOrder if present for the store
                    return validateDeliveryOrdersOfStores({
                        transaction,
                        storeIds,
                        originStoreId,
                        filteredStores,
                    });
                }
            }
        }
    }
    return [];
}

/**
 * this function validates if the selected storeIds for the route are available or not
 * it throws an error if the stops are in inprogress or completed status
 * @param {Object} payload
 * @returns the payload if no error else returns the error
 */
async function validateStoreDeliveriesAvailability(payload) {
    const newPayload = payload;
    const { stores, originStoreId } = payload;
    newPayload.storeId = originStoreId;
    if (stores && stores.length) {
        newPayload.stores = await getValidatedStores(newPayload);
    }
    return newPayload;
}

module.exports = {
    validateOrderDeliveriesAvailability,
    validateStoreDeliveriesAvailability,
};
